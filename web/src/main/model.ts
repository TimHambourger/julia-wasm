import S from 's-js';
import { MemoryPool } from '../shared/memoryPool';
import { ICanvasSize, IEscapeTimeConfig, IWorkerConfig } from '../shared/config';
import { IRunnerInitMsg, IWorkerInitMsg, MessageToUI } from '../shared/messages';
import { DataBundle } from './dataBundle';
import { shadeDark, shadeLight } from './colorizers';

/**
 * The size of a data chunk in pixels, i.e. canvas coordinates.
 * Influences the size of the data buffers that get shuttled back and forth
 * to the worker thread and populated via WASM.
 */
export const ChunkPixelSize = {
    height: 25,
    width: 25
};

export type App = ReturnType<typeof App>;
export function App() {
    const
        canvas = {
            reLeft: S.value(-1.5),
            // reRight - reLeft
            deltaRe: S.value(3),
            imBottom: S.value(-1.5),
            // imTop - imBottom
            deltaIm: S.value(3),
            // height of canvas in chunks
            chunksWidth: S.value(16),
            // width of canvas in chunks
            chunksHeight: S.value(16)
        },
        escapeTime = {
            c: {
                re: S.value(0),
                im: S.value(1)
            },
            maxIter: S.value(200),
            escapeRadius: S.value(2)
        },
        // EscapeTime data is 2 bytes per logical pixel
        escapeTimeDataPool = new MemoryPool(ChunkPixelSize.width * ChunkPixelSize.height * 2),
        // ImageData is 4 bytes per logical pixel
        imageDataPool = new MemoryPool(ChunkPixelSize.width * ChunkPixelSize.height * 4),
        escapeTimeData = S(() => {
            // Rebuild DataBundle if any of the following changes...
            // Also, Adam needs to add the array signature for S.on to the d.ts!!
            escapeTime.c.re();
            escapeTime.c.im();
            escapeTime.maxIter();
            escapeTime.escapeRadius();
            canvas.deltaRe();
            canvas.deltaIm();
            canvas.chunksWidth();
            canvas.chunksHeight();

            const data = new DataBundle<Uint16Array>();
            // Re-use buffers when constructing a new data bundle
            S.cleanup(() => data.crack().forEach(chunk => {
                escapeTimeDataPool.push(chunk.buffer);
            }));
            return data;
        }),
        colorizer = S.value(shadeDark({ r: 255, g: 0, b: 0 })),
        imageData = S(() => {
            const data = escapeTimeData().map<ImageData>((chunk, prevImage) => {
                const
                    _colorizer = colorizer(),
                    maxIter = escapeTime.maxIter(),
                    imageChunk = prevImage ? prevImage.data : new Uint8ClampedArray(imageDataPool.acquire());

                for (let i = 0; i * 4 < chunk.length && i < imageChunk.length; i += 4) {
                    const { r, g, b } = _colorizer(chunk[i / 4] / maxIter);
                    imageChunk[i] = r;
                    imageChunk[i + 1] = g;
                    imageChunk[i + 2] = b;
                    imageChunk[i + 3] = 255;
                }

                return new ImageData(imageChunk, ChunkPixelSize.width, ChunkPixelSize.height);
            });
            // Re-use buffers when constructing a new mapped bundle
            S.cleanup(() => data.crack().forEach(chunk => {
                imageDataPool.push(chunk.data.buffer);
            }));
            return data;
        });

    const worker = new Worker((window as any).WORKER_URL);

    worker.onmessage = ev => {
        const msg = ev.data as MessageToUI;

        if (msg.type === 'startup-failure') {
            throw new Error(msg.err);
        }

        // Before we commit data to the model, make sure the current UI params
        // match the params the data was constructed with...
        if (msg.runner.c.re === escapeTime.c.re() &&
            msg.runner.c.im === escapeTime.c.im() &&
            msg.runner.maxIter === escapeTime.maxIter() &&
            msg.runner.escapeRadius === escapeTime.escapeRadius() &&
            msg.canvas.reRight - msg.canvas.reLeft === canvas.deltaRe() &&
            msg.canvas.imTop - msg.canvas.imBottom === canvas.deltaIm() &&
            msg.canvas.chunksHeight === canvas.chunksHeight() &&
            msg.canvas.chunksWidth === canvas.chunksWidth()
        ) {
            escapeTimeData().get(msg.z)(new Uint16Array(msg.data));
        }
    };

    const workerInit : IWorkerInitMsg = {
        type: 'worker-init',
        config: {
            chunkSize: ChunkPixelSize,
            pauseInterval: 250
        }
    };
    worker.postMessage(workerInit);

    S(() => {
        const runnerInit : IRunnerInitMsg = {
            type: 'runner-init',
            runner: {
                c: {
                    re: escapeTime.c.re(),
                    im: escapeTime.c.im()
                },
                maxIter: escapeTime.maxIter(),
                escapeRadius: escapeTime.escapeRadius()
            },
            canvas: {
                reLeft: canvas.reLeft(),
                reRight: canvas.reLeft() + canvas.deltaRe(),
                imBottom: canvas.imBottom(),
                imTop: canvas.imBottom() + canvas.deltaIm(),
                chunksWidth: canvas.chunksWidth(),
                chunksHeight: canvas.chunksHeight()
            },
        };
        worker.postMessage(runnerInit);
    });

    return {
        canvas,
        escapeTime,
        colorizer,
        imageData
    };
}
