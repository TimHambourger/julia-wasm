import { IComplex } from './IComplex';
import { ICanvasConfig, ICanvasRect, IEscapeTimeConfig, IWorkerConfig } from './config';

/**
 * Initialize the worker.
 * Expect the UI to pass this message type only on worker construction.
 * The worker will ignore subsequent messages of this type.
 */
export interface IWorkerInitMsg {
    type : 'worker-init';
    worker : IWorkerConfig;
}

interface SequencedInstruction {
    /**
     * Sequence number for sorting messages to the worker.
     * Must be unique across all messages sent, excluding the worker-init message,
     * which is always processed first.
     */
    seqNo : number;
}

/**
 * Reset the worker
 */
export interface IWorkerResetMsg extends SequencedInstruction {
    type : 'worker-reset';
    escapeTime : IEscapeTimeConfig;
    canvas : ICanvasConfig;
    /**
     * Opaque (to the worker) identifier that will be passed back with returned chunk data.
     * The main thread can use this to filter out stale chunk update messages.
     */
    dataGen : number;
}

export interface IAddJobsMsg extends SequencedInstruction {
    type : 'add-jobs';
    jobs : ICanvasRect[];
    /** Buffers that are getting recylced back to the worker thread */
    buffers? : ArrayBuffer[];
}

export type WorkerInstructionMsg = IWorkerResetMsg | IAddJobsMsg;
export type MessageToWorker = IWorkerInitMsg | IWorkerResetMsg | IAddJobsMsg;

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
    /**
     * Top left corner of the returned chunk relative to the canvas's
     * origin, as an integer number of chunks. ChunkIds increase from
     * left to right and from top to bottom.
     */
    chunkId : IComplex;
    /**
     * The gen number sent with the IWorkerResetMsg the triggered this chunk update.
     */
    dataGen : number;
    data : ArrayBuffer;
}

export type MessageToMain = IStartupFailureMsg | IChunkUpdateMsg;
