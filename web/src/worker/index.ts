import { IWorkerConfig } from '../shared/config';
import { MessageToWorker, IRunnerInitMsg, IStartupFailureMsg } from '../shared/messages';
import { instantiate, Buffer } from './wasm/julia-wasm';
import { MemoryPool } from '../shared/memoryPool';
import { ChunkOfWork } from './chunkOfWork';
import { WorkerCore } from './workerCore';

let resolveWorkerConfig : (config : IWorkerConfig) => void,
    pool = null as MemoryPool | null,
    workerCore = null as WorkerCore | null,
    earlyRunnerInit = null as IRunnerInitMsg | null;

// Put bootstrapping code behind Promises.
// The goal is to get enough info to construct a WorkerCore, which then
// takes over processing.
const
    earlyBuffers = [] as ArrayBuffer[],
    initWasm = fetch('/dist/julia-wasm.wasm')
        .then(resp => resp.arrayBuffer())
        .then(bytes => instantiate(bytes, {})),
    getWorkerSpec = new Promise<IWorkerConfig>(resolve => resolveWorkerConfig = resolve),
    initWorkerCore = (async () => {
        const
            juliaWasm = await initWasm,
            { chunkSize: { height, width }, pauseInterval } = await getWorkerSpec,
            bufferSize = height * width,
            buffer = Buffer.new(bufferSize),
            chunk : ChunkOfWork = {
                buffer,
                view: new Uint16Array(juliaWasm.extra.memory.buffer, buffer.as_ptr(), bufferSize),
                width,
                height
            };

        // Times 2 to convert from u16 to u8
        pool = new MemoryPool(bufferSize * 2);
        pool.pushAll(earlyBuffers);
        while (earlyBuffers.pop()) {}

        workerCore = new WorkerCore(chunk, pauseInterval, pool);
        if (earlyRunnerInit) {
            workerCore.run(earlyRunnerInit.runner, earlyRunnerInit.canvas);
        }
        earlyRunnerInit = null;
    })();

initWorkerCore.catch(err => {
    // The worker has no way of recovering from startup errors.
    // Send back a specific message to the UI and trigger the Worker's onerror handler.
    // See https://stackoverflow.com/a/40081158
    const msg : IStartupFailureMsg = {
        type: 'startup-failure',
        err: '' + err
    };
    postMessage(msg);
    setTimeout(() => { throw err; }, 0);
});

onmessage = ev => {
    const data = ev.data as MessageToWorker;
    if (data.type === 'worker-init') {
        resolveWorkerConfig(data.config);
        return;
    }

    if (data.type === 'runner-init' || data.type === 'canvas-update') {
        // Absorb any returning buffers...
        if (data.buffers) {
            if (pool) {
                // If pool is already init'ed, go straight there...
                pool.pushAll(data.buffers);
            } else {
                // Otherwise save up for once init complete
                for (let i = 0; i < data.buffers.length; i++) {
                    earlyBuffers.push(data.buffers[i]);
                }
            }
        }
    }

    if (data.type === 'runner-init') {
        if (workerCore) {
            // If workerCore already init'ed, go straight there...
            workerCore.run(data.runner, data.canvas);
        } else {
            earlyRunnerInit = data;
        }
        return;
    }

    // TODO: Handle ICanvasUpdate...
};
