import { IComplex } from './IComplex';
import { ICanvasConfig, IEscapeTimeConfig, IWorkerConfig } from './config';

/**
 * Initialize the worker.
 * Expect the UI to pass this message type only on worker construction.
 * The worker will ignore subsequent messages of this type.
 */
export interface IWorkerInitMsg {
    type : 'worker-init';
    worker : IWorkerConfig;
}

/**
 * Update the worker's run params, optionally including a list of ArrayBuffers
 * to be recylced back to the worker.
 */
export interface IRunParamsUpdateMsg {
    type : 'run-params-update';
    escapeTime : IEscapeTimeConfig;
    canvas : ICanvasConfig;
    /** Buffers that are getting recylced back to the worker thread */
    buffers? : ArrayBuffer[];
}

export type MessageToWorker = IWorkerInitMsg | IRunParamsUpdateMsg;

/**
 * Sent by the worker on startup failure.
 */
export interface IStartupFailureMsg {
    type : 'startup-failure';
    err : string;
}

/**
 * Update the escape time data for a single canvas chunk.
 */
export interface IChunkUpdateMsg {
    type : 'chunk-update';
    z : IComplex;
    data : ArrayBuffer;
    escapeTime : IEscapeTimeConfig;
    canvas : ICanvasConfig;
}

export type MessageToMain = IStartupFailureMsg | IChunkUpdateMsg;
