import { IComplex } from './IComplex';
import { ICanvasSize, IEscapeTimeConfig, IWorkerConfig } from './config';

// Initialize the worker.
// Expect the UI to pass this message type only on worker construction.
export interface IWorkerInitMsg {
    type : 'worker-init';
    config: IWorkerConfig;
}

// Start or replace the runner.
// Expect the UI to pass this on worker construction and again when runner params change.
export interface IRunnerInitMsg {
    type : 'runner-init';
    runner : IEscapeTimeConfig;
    canvas : ICanvasSize;
    buffers? : ArrayBuffer[];
}

export type MessageToWorker = IWorkerInitMsg | IRunnerInitMsg | ICanvasUpdateMsg;

export interface ChunkUpdate {
    z : IComplex;
    data : ArrayBuffer;
}

export interface IStartupFailureMsg {
    type : 'startup-failure';
    err : string;
}

export interface IChunkUpdateMsg {
    type : 'chunk-update';
    z : IComplex;
    data : ArrayBuffer;
    runner : IEscapeTimeConfig;
    canvas : ICanvasSize;
}

export type MessageToUI = IStartupFailureMsg | IChunkUpdateMsg;
