import S from 's-js';
import { MemoryPool } from '../shared/memoryPool';
import { ICanvasConfig, IEscapeTimeConfig, IWorkerConfig } from '../shared/config';
import { IRunParamsUpdateMsg, IWorkerInitMsg, MessageToMain } from '../shared/messages';
import { DataBundle } from './dataBundle';
import { shadeDark, shadeLight } from './colorizers';

/**
 * The size of a data chunk in pixels, i.e. canvas coordinates.
 * Influences the size of the data buffers that get shuttled back and forth
 * to the worker thread and populated via WASM.
 */
export const ChunkSize = {
    heightPx: 32,
    widthPx: 32
};

export type App = ReturnType<typeof App>;
export function App(workerUrl : string) {
    const
        canvas = {
            // height of canvas in chunks
            canvasWidthChunks: S.value(16),
            // width of canvas in chunks
            canvasHeightChunks: S.value(16),
            topLeft: {
                re: S.value(-2),
                im: S.value(2),
            },
            bottomRight: {
                re: S.value(2),
                im: S.value(-2)
            }
        },
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

            const data = new DataBundle<Uint16Array>();

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
        const runParams : IRunParamsUpdateMsg = {
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
        };
        worker.postMessage(runParams);
    });

    return {
        canvas,
        escapeTime,
        colorizer,
        imageData
    };
}
