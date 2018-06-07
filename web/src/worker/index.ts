import { MessageToWorker, IWorkerInitMsg, WorkerInstructionMsg, IStartupFailureMsg } from '../shared/messages';
import { MemoryPool } from '../shared/memoryPool';
// Import WorkerCore synchronously, but we won't actually construct one until we make sure our wasm is booted.
// This is a workaround for the fact that webpack's bult-in wasm support currently can't import wasm into a
// web worker (falls at runtime due to use of document APIs).
import { WorkerCore } from './workerCore';
import { booted } from '../../wasm_output/julia_wasm_bg';

let resolveWorkerInitMsg = null as ((msg : IWorkerInitMsg) => void) | null,
    initialInstructions = [] as WorkerInstructionMsg[],
    workerCore = null as WorkerCore | null;

// Put bootstrapping code behind Promises.
// The goal is to get enough info to construct a WorkerCore, which then
// takes over processing.
const
    getWorkerInitMsg = new Promise<IWorkerInitMsg>(resolve => resolveWorkerInitMsg = resolve),
    initWorkerCore = (async () => {
        const initMsg = await getWorkerInitMsg;

        // Ensure wasm is booted before constructing workerCore.
        await booted;

        workerCore = new WorkerCore(initMsg);
        initialInstructions.forEach(msg => workerCore!.onmessage(msg));
        initialInstructions = [];
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
    const msg = ev.data as MessageToWorker;
    if (msg.type === 'worker-init') {
        if (resolveWorkerInitMsg) {
            resolveWorkerInitMsg(msg);
            resolveWorkerInitMsg = null;
        }
    } else {
        if (workerCore) workerCore.onmessage(msg);
        else initialInstructions.push(msg);
    }
};
