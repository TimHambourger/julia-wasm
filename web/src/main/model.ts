import S from 's-js';
import { MemoryPool } from '../shared/memoryPool';
import { ICanvasConfig, IEscapeTimeConfig, IWorkerConfig } from '../shared/config';
import { IRunParamsUpdateMsg, IWorkerInitMsg, MessageToMain } from '../shared/messages';
import { DataBundle } from './dataBundle';
import { shadeDark, shadeLight } from './colorizers';
import { IComplex } from '../shared/IComplex';

/**
 * The size of a data chunk in pixels, i.e. canvas coordinates.
 * Influences the size of the data buffers that get shuttled back and forth
 * to the worker thread and populated via WASM.
 */
export const ChunkSize = {
    heightPx: 1 << 6,
    widthPx: 1 << 6
};

export type App = ReturnType<typeof App>;
export function App(workerUrl : string) {
    const
        canvas = Canvas({
            // height of canvas in chunks
            canvasWidthChunks: 1 << 4,
            // width of canvas in chunks
            canvasHeightChunks: 1 << 4,
            topLeft: {
                re: -1.026316236461413,
                im: 1.026316236461413
            },
            bottomRight: {
                re: 1.026316236461413,
                im: -1.026316236461413
            }
        }),
        escapeTime = {
            c: {
                re: S.value(0),
                im: S.value(0.8)
            },
            maxIter: S.value(50),
            escapeRadius: S.value(2)
        },
        // EscapeTime data is 2 bytes per logical pixel
        escapeTimeDataPool = new MemoryPool(ChunkSize.widthPx * ChunkSize.heightPx * 2),
        // ImageData is 4 bytes per logical pixel
        imageDataPool = new MemoryPool(ChunkSize.widthPx * ChunkSize.heightPx * 4),
        escapeTimeData = S(() => {
            // Rebuild DataBundle if any of the following changes...
            // Also, Adam needs to add the array signature for S.on to the d.ts!!
            escapeTime.c.re();
            escapeTime.c.im();
            escapeTime.maxIter();
            escapeTime.escapeRadius();
            // TODO: Caching for panning
            canvas.topLeft.re();
            canvas.topLeft.im();
            canvas.bottomRight.re();
            canvas.bottomRight.im();
            canvas.canvasWidthChunks();
            canvas.canvasHeightChunks();

            const
                // precision for indexing by complex coordinates.
                // Set to size of a single pixel, which should be plenty.
                precision = {
                    re: (canvas.bottomRight.re() - canvas.topLeft.re()) / canvas.canvasWidthChunks() / ChunkSize.widthPx,
                    im: (canvas.bottomRight.im() - canvas.topLeft.im()) / canvas.canvasHeightChunks() / ChunkSize.heightPx
                },
                data = new DataBundle<Uint16Array>(precision);

            // Recycle buffers when constructing a new data bundle
            S.cleanup(() => data.crack().forEach(chunk => {
                chunk && escapeTimeDataPool.push(chunk.buffer);
            }));

            // Also recycle buffers if a chunk is updated with a new buffer or set to null
            data.map<Uint16Array | null>((curr, prev) => {
                if (prev && curr !== prev) escapeTimeDataPool.push(prev.buffer);
                return curr;
            });

            return data;
        }),
        colorizer = S.value(shadeDark({ r: 255, g: 0, b: 0 })),
        imageData = S(() => {
            const data = escapeTimeData().map<ImageData | null>((chunk, prevImage) => {
                if (!chunk) {
                    // Recycle previous image if chunk is being set to null
                    if (prevImage) imageDataPool.push(prevImage.data.buffer);
                    return null;
                }

                const
                    _colorizer = colorizer(),
                    maxIter = escapeTime.maxIter(),
                    // Modify previous image in place if we have one, otherwise acquire one from the pool
                    imageChunk = prevImage ? prevImage.data : new Uint8ClampedArray(imageDataPool.acquire());

                for (let i = 0; i / 4 < chunk.length && i < imageChunk.length; i += 4) {
                    const { r, g, b } = _colorizer(chunk[i / 4] / maxIter);
                    imageChunk[i] = r;
                    imageChunk[i + 1] = g;
                    imageChunk[i + 2] = b;
                    imageChunk[i + 3] = 255;
                }

                return new ImageData(imageChunk, ChunkSize.widthPx, ChunkSize.heightPx);
            });

            // Recycle buffers when constructing a new mapped bundle
            S.cleanup(() => data.crack().forEach(chunk => {
                chunk && imageDataPool.push(chunk.data.buffer);
            }));

            return data;
        });

    const worker = new Worker(workerUrl);

    worker.onmessage = ev => {
        const msg = ev.data as MessageToMain;

        if (msg.type === 'startup-failure') {
            throw new Error(msg.err);
        } else if (msg.type === 'chunk-update') {
            // Before we commit data to the model, make sure the current UI params
            // match the params the data was constructed with...
            if (msg.escapeTime.c.re === escapeTime.c.re() &&
                msg.escapeTime.c.im === escapeTime.c.im() &&
                msg.escapeTime.maxIter === escapeTime.maxIter() &&
                msg.escapeTime.escapeRadius === escapeTime.escapeRadius() &&
                msg.canvas.canvasWidthChunks === canvas.canvasWidthChunks() &&
                msg.canvas.canvasHeightChunks === canvas.canvasHeightChunks() &&
                msg.canvas.topLeft.re === canvas.topLeft.re() &&
                msg.canvas.topLeft.im === canvas.topLeft.im() &&
                msg.canvas.bottomRight.re === canvas.bottomRight.re() &&
                msg.canvas.bottomRight.im === canvas.bottomRight.im()
            ) {
                escapeTimeData().get(msg.z)(new Uint16Array(msg.data));
            }
        }
    };

    const workerInit : IWorkerInitMsg = {
        type: 'worker-init',
        worker: {
            chunkSize: ChunkSize,
            pauseInterval: 250
        }
    };
    worker.postMessage(workerInit);

    S(() => {
        const
            // Return contents of escapeTimeDataPool back to the worker to be refilled.
            returningBuffers = escapeTimeDataPool.drain(),
            runParams : IRunParamsUpdateMsg = {
                type: 'run-params-update',
                escapeTime: {
                    c: {
                        re: escapeTime.c.re(),
                        im: escapeTime.c.im()
                    },
                    maxIter: escapeTime.maxIter(),
                    escapeRadius: escapeTime.escapeRadius()
                },
                canvas: {
                    canvasWidthChunks: canvas.canvasWidthChunks(),
                    canvasHeightChunks: canvas.canvasHeightChunks(),
                    topLeft: {
                        re: canvas.topLeft.re(),
                        im: canvas.topLeft.im()
                    },
                    bottomRight: {
                        re: canvas.bottomRight.re(),
                        im: canvas.bottomRight.im()
                    }
                },
                buffers: returningBuffers
            };
        worker.postMessage(runParams, returningBuffers);
    });

    return {
        canvas,
        escapeTime,
        colorizer,
        imageData
    };
}

interface CanvasOptions {
    canvasWidthChunks : number;
    canvasHeightChunks : number;
    topLeft : IComplex;
    bottomRight : IComplex;
}

function Canvas(opts : CanvasOptions) {
    const
        canvasWidthChunks = S.value(opts.canvasWidthChunks),
        canvasHeightChunks = S.value(opts.canvasHeightChunks),
        topLeft = {
            re: S.value(opts.topLeft.re),
            im: S.value(opts.topLeft.im)
        },
        bottomRight = {
            re: S.value(opts.bottomRight.re),
            im: S.value(opts.bottomRight.im)
        };

    return {
        canvasWidthChunks,
        canvasHeightChunks,
        topLeft,
        bottomRight,
        zoom
    };

    /**
     * Zoom the canvas relative to its center point.
     * @param scaleFactor A complex number specifying how to scale the canvas's real
     * and imaginary axes. For each axis, 1 means preserve as is, > 1 means zoom
     * in, and < 1 means zoom out.
     */
    function zoom(scaleFactor : IComplex) {
        S.sample(() => {
            const
                delta = {
                    re: bottomRight.re() - topLeft.re(),
                    im: bottomRight.im() - topLeft.im()
                },
                center = {
                    re: topLeft.re() + delta.re / 2,
                    im: topLeft.im() + delta.im / 2
                },
                newDelta = {
                    // Ironically, we need to DIVIDE by the scale factor.
                    // That's b/c we want scale factors > 1 to zoom in, i.e. make the
                    // delta smaller, and analogously for scale factors < 1.
                    re: delta.re / scaleFactor.re,
                    im: delta.im / scaleFactor.im
                };

            S.freeze(() => {
                topLeft.re(center.re - newDelta.re / 2);
                topLeft.im(center.im - newDelta.im / 2);
                bottomRight.re(center.re + newDelta.re / 2);
                bottomRight.im(center.im + newDelta.im / 2);
            })
        });
    }
}
