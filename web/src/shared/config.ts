import { IComplex } from './IComplex';

export interface IWorkerConfig {
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

export interface IEscapeTimeConfig {
    c : IComplex;
    // 0 to 65535
    maxIter : number;
    escapeRadius : number;
}

export interface ICanvasSize {
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
