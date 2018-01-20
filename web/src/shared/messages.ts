export interface IComplex {
    re : number;
    im : number;
}

export interface WorkerConfig {
    // Sizes in logical pixels
    // Determines size of chunks that worker sends back to main thread
    chunkSize : {
        height : number,
        width : number
    },
    // Worker pauses periodically to give main thread a chance to invalidate the current runner
    // This is the interval for those pauses in ms.
    pauseInterval : number;
}

export interface EscapeTimeConfig {
    c : IComplex;
    // 0 to 65535
    maxIter : number;
    escapeRadius : number;
}

export interface CanvasSize {
    // We're agnostic to whether axes go from low to high or vice versa.
    // Our invariants are that the real axis is horizontal, the imaginary
    // axis is vertical, and we'll fill output buffers from left to right
    // and from top to bottom.
    reLeft : number;
    reRight : number;
    imTop : number;
    imBottom : number;
    // Sizes measured in chunks of work
    chunksWidth : number;
    chunksHeight : number;
}

// Initialize the worker.
// Expect the UI to pass this message type only on worker construction.
export interface IWorkerInitMsg {
    type : 'worker-init';
    config: WorkerConfig;
}

// Start or replace the runner.
// Expect the UI to pass this on worker construction and again when runner params change.
export interface IRunnerInitMsg {
    type : 'runner-init';
    runner : EscapeTimeConfig;
    canvas : CanvasSize;
    buffers? : ArrayBuffer[];
}

// Update canvas positioning or size.
// This is how the UI pans and zooms.
// TODO: Strategy for communicating which portions of the canvas need updates.
export interface ICanvasUpdateMsg {
    type : 'canvas-update';
    canvas : CanvasSize;
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
    update : ChunkUpdate;
}

export type MessageToUI = IStartupFailureMsg | IChunkUpdateMsg;
