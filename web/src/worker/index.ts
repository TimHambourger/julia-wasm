import { MessageToWorker, IWorkerInitMsg, WorkerInstructionMsg, IStartupFailureMsg } from '../shared/messages';
import { MemoryPool } from '../shared/memoryPool';
// IMPORTANT: Only importing the WorkerCoreType synchronously.
// This is a type-only import that will get removed by typescript before processing by webpack.
// We import that the actual WorkerCore class constructor via a dynamic import below.
// This is b/c currently webpack can only import wasm in dependency graphs rooted in a dynamic import.
import { WorkerCoreType } from './workerCore';

let resolveWorkerInitMsg = null as ((msg : IWorkerInitMsg) => void) | null,
    initialInstructions = [] as WorkerInstructionMsg[],
    workerCore = null as WorkerCoreType | null;

// Put bootstrapping code behind Promises.
// The goal is to get enough info to construct a WorkerCore, which then
// takes over processing.
const
    getWorkerInitMsg = new Promise<IWorkerInitMsg>(resolve => resolveWorkerInitMsg = resolve),
    // Import the workerCore module async/dynamically. This is handled by webpack.
    importWorkerCore = import(/* webpackChunkName: "workerCore" */ './workerCore'),
    initWorkerCore = (async () => {
        const
            WorkerCore = (await importWorkerCore).WorkerCore,
            initMsg = await getWorkerInitMsg;

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
