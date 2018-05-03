import { ICanvasSize, IEscapeTimeConfig } from '../shared/config';
import { IChunkUpdateMsg } from '../shared/messages';
import { ChunkOfWork } from './chunkOfWork';
import { MemoryPool } from '../shared/memoryPool';
import { EscapeTimeRunner } from './escapeTimeRunner';

export class WorkerCore {
    private runner : EscapeTimeRunner | null;
    private resumeTimeout : number | null;

    constructor(
        private readonly chunk : ChunkOfWork,
        private readonly pauseInterval : number,
        private readonly pool : MemoryPool
    ) {
        this.runner = null;
        this.resumeTimeout = null;
    }

    run(config : IEscapeTimeConfig, canvas : ICanvasSize) {
        this.runner && this.runner.dispose();
        if (this.resumeTimeout !== null) clearTimeout(this.resumeTimeout);
        this.runner = new EscapeTimeRunner(config, canvas, this.chunk);
        this.resumeTimeout = setTimeout(() => this.resume(), 0);
    }

    // TODO: Panning, zooming, etc...

    private resume() {
        if (!this.runner) return;
        const startTime = performance.now();
        while (this.runner.advance() && performance.now() - startTime < this.pauseInterval) {
            const
                z = this.runner.loadChunk(),
                data = this.pool.acquire(),
                view = new Uint16Array(data);

            for (let i = 0; i < view.length && i < this.chunk.view.length; i++) {
                view[i] = this.chunk.view[i];
            }

            const msg : IChunkUpdateMsg = {
                type: 'chunk-update',
                z,
                data,
                runner: this.runner.config,
                canvas: this.runner.canvas
            };
            postMessage(msg, [data]);
        }

        if (this.runner.hasRemaining()) {
            setTimeout(() => this.resume(), 0);
        }
    }
}
