import { Complex, EscapeTimeAPI } from './wasm/julia-wasm';
import { IComplex } from '../shared/IComplex';
import { IEscapeTimeConfig, ICanvasSize } from '../shared/config';
import { ChunkOfWork } from './chunkOfWork';

export class EscapeTimeRunner {
    private readonly api : EscapeTimeAPI;

    private z : IComplex;
    private step : IComplex;

    constructor(
        public readonly config : IEscapeTimeConfig,
        // TODO: Support panning, zooming...
        public readonly canvas : ICanvasSize,
        private readonly chunk : ChunkOfWork,
    ) {
        const { c, maxIter, escapeRadius } = config;
        this.api = EscapeTimeAPI.new(Complex.new(c.re, c.im), maxIter, escapeRadius);
        this.step = computeStep(canvas, chunk);
        this.z = initialZ(canvas, this.step);
    }

    // Load the next chunk of data into the buffer and return the starting z
    // value (upper left corner) for the chunk just loaded.
    loadNext() {
        this.api.load(
            this.chunk.buffer,
            this.chunk.width,
            // Add a half step so we're calculating from the center of each logical pixel,
            // rather than from the upper left corner.
            this.z.re + this.step.re / 2,
            this.z.im + this.step.im / 2,
            this.step.re,
            this.step.im
        );
        return this.z;
    }

    /**
     * Try advancing to the next chunk.
     * Returns true if successful and false if we've exhausted the canvas.
     */
    advance() {
        const next = nextZ(this.z, this.step, this.canvas, this.chunk);
        if (!next) return false;
        this.z = next;
        return true;
    }

    hasNext() {
        return !!nextZ(this.z, this.step, this.canvas, this.chunk);
    }

    dispose() {
        this.api.free();
    }
}

function computeStep(
    {
        reLeft,
        reRight,
        imTop,
        imBottom,
        chunksWidth,
        chunksHeight
    } : ICanvasSize,
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
    { reLeft, imTop } : ICanvasSize,
    step : IComplex
) : IComplex {
    return {
        re: reLeft,
        im: imTop
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
    } : ICanvasSize,
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

    // Modify the passed in z in place to cut down on allocations
    z.re = nextRe;
    z.im = nextIm;

    return z;
}
