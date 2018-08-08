import { IWorkerConfig } from '../shared/config';
import { WorkerInstructionMsg, IWorkerInitMsg, IWorkerResetMsg, IAddJobsMsg, IChunkUpdateMsg } from '../shared/messages';
import { MemoryPool } from '../shared/memoryPool';
import { Buffer, Canvas, CanvasRect, EscapeTime, EscapeTimeRunner } from '../../wasm_output/julia_wasm';
import * as rawWasm from '../../wasm_output/julia_wasm_bg';

// Basically, a Rust Vec<u16> represented as both an opaque Buffer object for passing
// into Rust methods and as a Uint16Array for reading in JS.
interface OutputBuffer {
    buffer : Buffer;
    view : Uint16Array;
}

// With current webpack constraints, it's important that index.ts only import
// WorkerCore as a type, not as a value. To get a handle on the WorkerCore class
// constructor, index.ts must use an async import(...).
// To help enforce this constraint, expose a WorkerCoreType that makes misuse
// easier to spot.
export type WorkerCoreType = WorkerCore;
export class WorkerCore {
    private readonly workerConfig : IWorkerConfig;
    private readonly pool : MemoryPool;
    private readonly output : OutputBuffer;
    private runner : EscapeTimeRunner | null;
    private dataGen : number | null;
    private resumeTimeout : number | null;
    private pendingMessages : WorkerInstructionMsg[];

    constructor(
        init : IWorkerInitMsg
    ) {
        const
            { chunkSizePx: { width, height } } = init.worker,
            bufferSize = width * height,
            buffer = Buffer.new(bufferSize);

        this.workerConfig = init.worker;
        // Times 2 to convert from u16 to u8
        this.pool = new MemoryPool(bufferSize * 2);
        this.output = {
            buffer,
            view: new Uint16Array(rawWasm.memory.buffer, buffer.as_ptr(), bufferSize),
        };
        this.runner = null;
        this.dataGen = null;
        this.resumeTimeout = null;
        this.pendingMessages = [];
    }

    onmessage(msg : WorkerInstructionMsg) {
        this.pendingMessages.push(msg);
        this.setAlarm();
    }

    private setAlarm() {
        if (this.resumeTimeout !== null) clearTimeout(this.resumeTimeout);
        this.resumeTimeout = setTimeout(() => {
            this.processMessages();
            this.runJobs();
        });
    }

    private processMessages() {
        // Sort by sequence number descending
        this.pendingMessages.sort((msg1, msg2) => msg2.seqNo - msg1.seqNo);
        const
            // Find the index of the last worker reset msg by seqNo. I.e. the first in our descending sort.
            resetMsgIdx = this.pendingMessages.findIndex(msg => msg.type === 'worker-reset'),
            resetMsg = resetMsgIdx >= 0 ? this.pendingMessages[resetMsgIdx] : null,
            // Add jobs messages sent before the most recent reset message get thrown away.
            addJobsMsgs = resetMsgIdx >= 0 ? this.pendingMessages.slice(0, resetMsgIdx) : this.pendingMessages;

        if (resetMsg) {
            // We validated this above. Re-asserting here gets back strong typing w/o needing a brittle cast.
            if (resetMsg.type !== 'worker-reset') throw new Error(`Unexpected reset msg type: ${resetMsg.type}`);
            this.reset(resetMsg);
        }

        // Now sort by seq no ascending. We want to push jobs in the order they were sent.
        addJobsMsgs.reverse();
        addJobsMsgs.forEach(msg => {
            // We validated this above. Re-asserting here gets back strong typing w/o needing a brittle cast.
            if (msg.type === 'worker-reset') throw new Error(`Unexpected msg type: ${msg.type}`);
            this.addJobs(msg);
        });
        this.pendingMessages = [];
    }

    private reset(msg : IWorkerResetMsg) {
        if (this.runner) this.runner.free();
        this.runner = EscapeTimeRunner.new(
            EscapeTime.new(
                msg.escapeTime.c.re,
                msg.escapeTime.c.im,
                msg.escapeTime.maxIter,
                msg.escapeTime.escapeRadius
            ),
            Canvas.new(
                this.workerConfig.chunkSizePx.width,
                this.workerConfig.chunkSizePx.height,
                msg.canvas.chunkDelta.re,
                msg.canvas.chunkDelta.im,
                msg.canvas.origin.re,
                msg.canvas.origin.im
            )
        );
        this.dataGen = msg.dataGen;
    }

    private addJobs(msg : IAddJobsMsg) {
        if (this.runner) {
            msg.jobs.forEach(job => {
                this.runner!.push_job(CanvasRect.new(job.topLeft.re, job.topLeft.im, job.widthChunks, job.heightChunks));
            });
        }
        if (msg.buffers) this.pool.pushAll(msg.buffers);
    }

    private runJobs() {
        if (!this.runner || this.dataGen === null) return;

        const startTime = performance.now();
        // Track whether we exit while loop b/c we run out of chunks or out of time.
        let paused = false;
        // Continue processing until we hit pause interval or run out of chunks.
        // Check pause interval BEFORE advancing runner so we don't advance runner w/o
        // then loading chunk data.
        while (!(paused = performance.now() - startTime >= this.workerConfig.pauseInterval) && this.runner.advance()) {
            this.runner.load(this.output.buffer);
            const
                chunkId = {
                    re: this.runner.current_re(),
                    im: this.runner.current_im()
                },
                data = this.pool.acquire(),
                view = new Uint16Array(data);

            for (let i = 0; i < view.length && i < this.output.view.length; i++) {
                view[i] = this.output.view[i];
            }

            const msg : IChunkUpdateMsg = {
                type: 'chunk-update',
                chunkId,
                dataGen: this.dataGen,
                data
            };
            postMessage(msg, [data]);
        }

        // If we exited loop b/c we hit our pause interval, setAlarm to keep processing
        // after giving onmessage events a chance to fire.
        if (paused) this.setAlarm();
    }
}
