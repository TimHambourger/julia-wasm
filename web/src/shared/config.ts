import { IComplex } from './IComplex';

export interface IWorkerConfig {
    /**
     * The size of the chunks that will be sent from the worker to the main thread.
     */
    chunkSize : {
        widthPx : number;
        heightPx : number;
    };

    /**
     * The worker pauses periodically to give the main thread a chance to invalidate the current
     * run params. This is the interval for those pauses in ms.
     */
    pauseInterval : number;
}

export interface IEscapeTimeConfig {
    c : IComplex;
    // 0 to 65535
    maxIter : number;
    escapeRadius : number;
}

export interface ICanvasConfig {
    canvasWidthChunks : number;
    canvasHeightChunks : number;
    // We're agnostic to whether axes go from low to high or vice versa.
    // Our invariants are that the real axis is horizontal, the imaginary
    // axis is vertical, and we'll fill output buffers from left to right
    // and from top to bottom.
    topLeft : IComplex;
    bottomRight : IComplex;
}
