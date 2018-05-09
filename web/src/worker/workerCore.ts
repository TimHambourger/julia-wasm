import { IWorkerConfig, ICanvasConfig, IEscapeTimeConfig } from '../shared/config';
import { IChunkUpdateMsg } from '../shared/messages';
import { MemoryPool } from '../shared/memoryPool';
import { Buffer, Canvas, EscapeTimeRunner, EscapeTime } from './wasm/julia_wasm';
import * as rawWasm from './wasm/julia_wasm_bg';

// Basically, a Rust Vec<u16> represented as both an opaque Buffer object for passing
// into Rust methods and as a Uint16Array for reading in JS.
interface OutputBuffer {
    buffer : Buffer;
    view : Uint16Array;
}

// With current webpack constraints, it's important that index.ts only import
// WorkerCore as a type, not as a value. To get a handle on the WorkerCore class
// constructor, index.ts must use an async import(...).
export type WorkerCoreType = InstanceType<typeof WorkerCore>;
export class WorkerCore {
    private readonly pool : MemoryPool;
    private readonly output : OutputBuffer;
    private readonly runner : EscapeTimeRunner;
    private resumeTimeout : number;

    constructor(
        private readonly workerConfig : IWorkerConfig,
        private escapeTimeConfig : IEscapeTimeConfig,
        private canvasConfig : ICanvasConfig,
        earlyBuffers : ArrayBuffer[] | undefined
    ) {
        const
            { chunkSize: { widthPx, heightPx } } = workerConfig,
            bufferSize = widthPx * heightPx,
            buffer = Buffer.new(bufferSize);

        // Times 2 to convert from u16 to u8
        this.pool = new MemoryPool(bufferSize * 2);
        if (earlyBuffers) this.pool.pushAll(earlyBuffers);
        this.output = {
            buffer,
            view: new Uint16Array(rawWasm.memory.buffer, buffer.as_ptr(), bufferSize),
        };
        this.runner = EscapeTimeRunner.new(escapeTimeFactory(escapeTimeConfig), canvasFactory(workerConfig, canvasConfig));
        this.resumeTimeout = setTimeout(() => this.resume(), 0);
    }

    update(escapeTimeConfig : IEscapeTimeConfig, canvasConfig : ICanvasConfig, returningBuffers : ArrayBuffer[] | undefined) {
        this.escapeTimeConfig = escapeTimeConfig;
        this.canvasConfig = canvasConfig;
        this.runner.update(escapeTimeFactory(escapeTimeConfig), canvasFactory(this.workerConfig, canvasConfig));
        if (returningBuffers) this.pool.pushAll(returningBuffers);
        clearTimeout(this.resumeTimeout);
        this.resumeTimeout = setTimeout(() => this.resume(), 0);
    }

    private resume() {
        const startTime = performance.now();
        while (this.runner.has_next() && performance.now() - startTime < this.workerConfig.pauseInterval) {
            this.runner.load_next(this.output.buffer);
            const
                z = {
                    re: this.runner.last_chunk_loaded_re(),
                    im: this.runner.last_chunk_loaded_im()
                },
                data = this.pool.acquire(),
                view = new Uint16Array(data);

            for (let i = 0; i < view.length && i < this.output.view.length; i++) {
                view[i] = this.output.view[i];
            }

            const msg : IChunkUpdateMsg = {
                type: 'chunk-update',
                z,
                data,
                escapeTime: this.escapeTimeConfig,
                canvas: this.canvasConfig
            };
            postMessage(msg, [data]);
        }

        if (this.runner.has_next()) {
            this.resumeTimeout = setTimeout(() => this.resume(), 0);
        }
    }
}

function escapeTimeFactory(config : IEscapeTimeConfig) {
    return EscapeTime.new(
        config.c.re,
        config.c.im,
        config.maxIter,
        config.escapeRadius
    );
}

function canvasFactory(workerConfig : IWorkerConfig, canvasConfig : ICanvasConfig) {
    return Canvas.new(
        workerConfig.chunkSize.widthPx,
        workerConfig.chunkSize.heightPx,
        canvasConfig.canvasWidthChunks,
        canvasConfig.canvasHeightChunks,
        canvasConfig.topLeft.re,
        canvasConfig.topLeft.im,
        canvasConfig.bottomRight.re,
        canvasConfig.bottomRight.im
    );
}
