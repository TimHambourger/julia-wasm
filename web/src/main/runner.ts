import S from 's-js';
import { IComplex } from '../shared/IComplex';
import { IEscapeTimeConfig, ICanvasConfig, ICanvasRect } from '../shared/config';
import { IWorkerInitMsg, IWorkerResetMsg, IAddJobsMsg, MessageToMain } from '../shared/messages';
import { MemoryPool } from '../shared/memoryPool';
import { DataBundle, IBundle } from './lib/dataBundle';
import { CanvasMgr, ChunkSizePx } from './canvasMgr';

export interface EscapeTimeRunnerOptions extends IEscapeTimeConfig {}

// EscapeTimeRunner is the layer the instantiates and calls workers and populates result data
export type EscapeTimeRunner = ReturnType<typeof EscapeTimeRunner>;
export function EscapeTimeRunner(canvasMgr : CanvasMgr, workerUrl : string, opts : EscapeTimeRunnerOptions) {
    const
        c = {
            re: S.value(opts.c.re),
            im: S.value(opts.c.im)
        },
        maxIter = S.value(opts.maxIter),
        escapeRadius = S.value(opts.escapeRadius),
        // EscapeTime data is 2 bytes per logical pixel
        pool = new MemoryPool(ChunkSizePx.width * ChunkSizePx.height * 2),
        resetMsgData = S<{ escapeTime : IEscapeTimeConfig, canvas : ICanvasConfig }>(() => ({
            escapeTime: {
                c: {
                    re: c.re(),
                    im: c.im()
                },
                maxIter: maxIter(),
                escapeRadius: escapeRadius()
            },
            canvas: canvasMgr.canvasConfig()
        })),
        dataGen = S.on(resetMsgData, count => count + 1, -1),
        resultData = S(() => {
            resetMsgData();

            const data = new DataBundle<Uint16Array>();

            // Recycle buffers when constructing a new data bundle
            S.cleanup(() => data.crack().forEach(chunk => {
                chunk && pool.push(chunk.buffer);
            }));

            // Also recycle buffers if a chunk is updated with a new buffer or set to null
            data.map<Uint16Array | null>((curr, chunkId, prev) => {
                if (prev && curr !== prev) pool.push(prev.buffer);
                return curr;
            }, () => null);

            return data;
        });

    const worker = new Worker(workerUrl);

    worker.onmessage = ev => {
        const msg = ev.data as MessageToMain;

        if (msg.type === 'startup-failure') {
            throw new Error(msg.err);
        } else if (msg.type === 'chunk-update') {
            // Before we commit data to the model, make sure the message's dataGen matches our current
            if (msg.dataGen === dataGen()) {
                resultData().get(msg.chunkId)(new Uint16Array(msg.data));
            }
        }
    };

    const workerInit : IWorkerInitMsg = {
        type: 'worker-init',
        worker: {
            chunkSizePx: ChunkSizePx,
            pauseInterval: 250
        }
    };
    worker.postMessage(workerInit);

    let instructionSeqNo = 0;

    S(() => {
        // Send worker a reset msg whenever our reset msg data changes...
        const
            resetMsg : IWorkerResetMsg = {
                type: 'worker-reset',
                escapeTime: resetMsgData().escapeTime,
                canvas: resetMsgData().canvas,
                dataGen: dataGen(),
                seqNo: instructionSeqNo++
            };
        worker.postMessage(resetMsg);

        // After that, send an add jobs msg whenever the canvas rect changes
        S<ICanvasRect | null>(prev => {
            const
                // Recycle buffers back to the worker
                returningBuffers = pool.drain(),
                canvasRect = canvasMgr.rect.canvasRect(),
                jobs =
                    canvasRect ?
                        prev ?
                            excludedRects(canvasRect, prev) :
                            [canvasRect] :
                        [],
                addJobsMsg : IAddJobsMsg = {
                    type: 'add-jobs',
                    jobs,
                    seqNo: instructionSeqNo++,
                    buffers: returningBuffers
                };
            worker.postMessage(addJobsMsg, returningBuffers);
            return canvasRect;
        }, null);
    });

    return {
        c,
        maxIter,
        escapeRadius,
        // Expose resultData as read-only
        resultData: resultData as () => IBundle<Uint16Array | null>,
        currentOpts,
        updateOpts
    };

    function currentOpts() : EscapeTimeRunnerOptions {
        return {
            c: {
                re: c.re(),
                im: c.im()
            },
            maxIter: maxIter(),
            escapeRadius: escapeRadius()
        };
    }

    function updateOpts(opts : EscapeTimeRunnerOptions) {
        S.freeze(() => {
            c.re(opts.c.re);
            c.im(opts.c.im);
            maxIter(opts.maxIter);
            escapeRadius(opts.escapeRadius);
        });
    }
}

/**
 * Get those portions of rect1 that are excluded by rect2, represented as a list of sub-rects.
 * In set notation, returns rect1 - rect2.
 */
function excludedRects(rect1 : ICanvasRect, rect2 : ICanvasRect) : ICanvasRect[] {
    const
        results = [] as ICanvasRect[],
        rectAbove : ICanvasRect = {
            topLeft: rect1.topLeft,
            widthChunks: rect1.widthChunks,
            heightChunks: Math.max(Math.min(rect2.topLeft.im - rect1.topLeft.im, rect1.heightChunks), 0)
        };
    if (rectAbove.widthChunks * rectAbove.heightChunks > 0) results.push(rectAbove);

    const
        rect1Bottom = rect1.topLeft.im + rect1.heightChunks,
        rect2Bottom = rect2.topLeft.im + rect2.heightChunks,
        rectBelowHeight = Math.max(Math.min(rect1Bottom - rect2Bottom, rect1.heightChunks), 0),
        rectBelow : ICanvasRect = {
            topLeft: {
                re: rect1.topLeft.re,
                im: rect1Bottom - rectBelowHeight
            },
            widthChunks: rect1.widthChunks,
            heightChunks: rectBelowHeight
        };
    if (rectBelow.widthChunks * rectBelow.heightChunks > 0) results.push(rectBelow);

    const
        rectAboveBottom = rectAbove.topLeft.im + rectAbove.heightChunks,
        // We'll give rectAbove/rectBelow priority over rectLeft/rectRight so the returned rects are all disjoint.
        // This gives the height available btwn the bottom of rectAbove and the top of rectBelow.
        sideRectsHeight = Math.max(rectBelow.topLeft.im - rectAboveBottom, 0),
        rectLeft : ICanvasRect = {
            topLeft: {
                re: rect1.topLeft.re,
                im: rectAboveBottom
            },
            widthChunks: Math.max(Math.min(rect2.topLeft.re - rect1.topLeft.re, rect1.widthChunks), 0),
            heightChunks: sideRectsHeight
        };
    if (rectLeft.widthChunks * rectLeft.heightChunks > 0) results.push(rectLeft);

    const
        rect1Right = rect1.topLeft.re + rect1.widthChunks,
        rect2Right = rect2.topLeft.re + rect2.widthChunks,
        rectRightWidth = Math.max(Math.min(rect1Right - rect2Right, rect1.widthChunks), 0),
        rectRight : ICanvasRect = {
            topLeft: {
                re: rect1Right - rectRightWidth,
                im: rectAboveBottom
            },
            widthChunks: rectRightWidth,
            heightChunks: sideRectsHeight
        };
    if (rectRight.widthChunks * rectRight.heightChunks > 0) results.push(rectRight);

    return results;
}
