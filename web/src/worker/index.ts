import { MessageToWorker, IWorkerInitMsg, IRunParamsUpdateMsg, IStartupFailureMsg } from '../shared/messages';
import { MemoryPool } from '../shared/memoryPool';
// IMPORTANT: Only importing the WorkerCoreType synchronously.
// This is a type-only import that will get removed by typescript before processing by webpack.
// We import that the actual WorkerCore class constructor via a dynamic import below.
// This is b/c currently webpack can only import wasm in dependency graphs rooted in a dynamic import.
import { WorkerCoreType } from './workerCore';

let resolveWorkerInitMsg = null as ((msg : IWorkerInitMsg) => void) | null,
    resolveEnsureRunParams = null as (() => void) | null,
    initialRunParams = null as IRunParamsUpdateMsg | null,
    workerCore = null as WorkerCoreType | null;

// Put bootstrapping code behind Promises.
// The goal is to get enough info to construct a WorkerCore, which then
// takes over processing.
const
    getWorkerInitMsg = new Promise<IWorkerInitMsg>(resolve => resolveWorkerInitMsg = resolve),
    ensureRunParams = new Promise<void>(resolve => resolveEnsureRunParams = resolve),
    // Import the workerCore module async/dynamically. This is handle by webpack.
    importWorkerCore = import(/* webpackChunkName: "workerCore" */ './workerCore'),
    initWorkerCore = (async () => {
        const
            WorkerCore = (await importWorkerCore).WorkerCore,
            initMsg = await getWorkerInitMsg;

        await ensureRunParams;

        workerCore = new WorkerCore(
            initMsg.worker,
            initialRunParams!.escapeTime,
            initialRunParams!.canvas,
            initialRunParams!.buffers
        );
        initialRunParams = null;
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
        if (resolveWorkerInitMsg) {
            resolveWorkerInitMsg(data);
            resolveWorkerInitMsg = null;
        }
    } else if (data.type === 'run-params-update') {
        if (workerCore) {
            workerCore.update(data.escapeTime, data.canvas, data.buffers);
        } else {
            initialRunParams = data;
            if (resolveEnsureRunParams) {
                resolveEnsureRunParams();
                resolveEnsureRunParams = null;
            }
        }
    }
};
