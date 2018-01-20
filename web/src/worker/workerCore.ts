import { EscapeTimeConfig, CanvasSize, IChunkUpdateMsg } from '../shared/messages';
import { ChunkOfWork } from './chunkOfWork';
import { MemoryPool } from './memoryPool';
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

    run(config : EscapeTimeConfig, canvas : CanvasSize) {
        this.runner && this.runner.dispose();
        if (this.resumeTimeout !== null) clearTimeout(this.resumeTimeout);
        this.runner = new EscapeTimeRunner(config, this.chunk, canvas);
        this.resumeTimeout = setTimeout(() => this.resume(), 0);
    }

    // TODO: Panning, zooming, etc...

    private resume() {
        if (!this.runner) return;
        const startTime = performance.now();
        while (this.runner.advance() && performance.now() - startTime < this.pauseInterval) {
            const
                z = this.runner.loadChunk(),
                data = this.pool.emit(),
                view = new Uint16Array(data);

            for (let i = 0; i < view.length && i < this.chunk.view.length; i++) {
                view[i] = this.chunk.view[i];
            }

            const msg : IChunkUpdateMsg = {
                type: 'chunk-update',
                update: { z, data }
            };
            postMessage(msg, [data]);
        }

        if (this.runner.hasRemaining()) {
            setTimeout(() => this.resume(), 0);
        }
    }
}
