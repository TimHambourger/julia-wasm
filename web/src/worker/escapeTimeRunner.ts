import { Complex, EscapeTimeAPI } from './wasm/julia-wasm';
import { IComplex, EscapeTimeConfig, CanvasSize } from '../shared/messages';
import { ChunkOfWork } from './chunkOfWork';

export class EscapeTimeRunner {
    private readonly api : EscapeTimeAPI;

    private canvasSize : CanvasSize;
    private z : IComplex;
    private step : IComplex;

    constructor(
        { c, maxIter, escapeRadius } : EscapeTimeConfig,
        private readonly chunk : ChunkOfWork,
        initCanvasSize : CanvasSize
    ) {
        this.api = EscapeTimeAPI.new(Complex.new(c.re, c.im), maxIter, escapeRadius);
        this.canvasSize = initCanvasSize;
        this.step = computeStep(initCanvasSize, chunk);
        this.z = initialZ(initCanvasSize, this.step);
    }

    // Load the next chunk of data into the buffer and return the starting z
    // value (upper left corner) for the chunk just loaded.
    loadChunk() {
        this.api.load(
            this.chunk.buffer,
            this.chunk.width,
            Complex.new(this.z.re, this.z.im),
            Complex.new(this.step.re, this.step.im)
        );
        return this.z;
    }

    // Try advancing to the next chunk.
    // Returns true if successful and false if we've exhausted the canvas.
    advance() {
        const next = nextZ(this.z, this.step, this.canvasSize, this.chunk);
        if (!next) return false;
        this.z = next;
        return true;
    }

    hasRemaining() {
        return !!nextZ(this.z, this.step, this.canvasSize, this.chunk);
    }

    dispose() {
        this.api.free();
    }

    // TODO: Support panning, zooming...
}

function computeStep(
    {
        reLeft,
        reRight,
        imTop,
        imBottom,
        chunksWidth,
        chunksHeight
    } : CanvasSize,
    { width, height } : ChunkOfWork
) : IComplex {
    // Load output buffer from left to right and from top to bottom
    return {
        re: chunksWidth * width > 0 ?
            (reRight - reLeft) / chunksWidth / width : 0,
        im: chunksHeight * height > 0 ?
            (imBottom - imTop) / chunksHeight / height : 0
    };
}

// TODO: Maybe experiment with starting in center of canvas and spiraling out...
function initialZ(
    { reLeft, imTop } : CanvasSize,
    step : IComplex
) : IComplex {
    // Add a half step so we're calculating from the center of each logical pixel.
    return {
        re: reLeft + step.re / 2,
        im: imTop + step.im / 2
    };
}

// TODO: Maybe experiment with starting in center of canvas and spiraling out...
function nextZ(
    z : IComplex,
    step : IComplex,
    {
        reLeft,
        reRight,
        imTop,
        imBottom
    } : CanvasSize,
    chunk : ChunkOfWork
) {
    const
        signRe = Math.sign(reRight - reLeft),
        signIm = Math.sign(imBottom - imTop);

    let nextRe = z.re + step.re * chunk.width,
        nextIm = z.im;

    if (signRe * nextRe > signRe * reRight) {
        nextRe = reLeft + step.re / 2;
        nextIm = z.im + step.im * chunk.height;
    }

    if (signIm * nextIm > signIm * imBottom) {
        // Exhausted canvas
        return null;
    }

    return {
        re: nextRe,
        im: nextIm
    };
}
