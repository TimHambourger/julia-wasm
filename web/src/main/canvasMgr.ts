import S from 's-js';
import { IComplex } from '../shared/IComplex';
import { ICanvasConfig, ICanvasRect } from '../shared/config';

export interface CanvasMgrOptions {
    /**
     * Center of the displayed canvas in complex coordinates.
     */
    center : IComplex;

    /**
     * Number of browser px per change of 1 in complex coordinates, in either real or imaginary axis.
     */
    zoom : number;

    /**
     * Number of logical px per browser px, in either real or imaginary axis.
     */
    resolution : number;
}

/**
 * The size of a data chunk in logical pixels.
 * Influences the size of the data buffers that get shuttled back and forth
 * to the worker thread and populated via WASM.
 */
export const ChunkSizePx = {
    height: 1 << 5,
    width: 1 << 5
};

// CanvasMgr is concerned with setting canvas size and position, translating btwn different coordinate systems.
export type CanvasMgr = ReturnType<typeof CanvasMgr>;
export function CanvasMgr(opts : CanvasMgrOptions) {
    const
        // Size of canvas in browser px
        canvasSizeBrowserPx = {
            width:  S.value<number | null>(null),
            height: S.value<number | null>(null)
        },
        // Number of browser px per change of 1 in complex coordinates
        zoom = S.value(opts.zoom),
        // Ratio of logical px to browser px. Higher means more logical px per browser px.
        resolution = S.value(opts.resolution),
        // Center of the displayed canvas in complex coordinates
        center = {
            re: S.value(opts.center.re),
            im: S.value(opts.center.im)
        },
        // Initialize origin to match center, then reset to center whenever zoom or resolution change
        originTrigger = () => {
            zoom();
            resolution();
        },
        // Origin in the sense of WASM's Canvas struct.
        // Not necessarily the center of the displayed canvas.
        // Instead, the complex coordinates that correspond to ChunkId 0 + 0i.
        origin = {
            re: S.on(originTrigger, () => center.re()),
            im: S.on(originTrigger, () => center.im())
        },
        // Bottom right - top left in complex coordinates for any given chunk
        chunkDelta = {
            // Conventional orientation -- real axis increases from left to right, imaginary axis decreases from top to bottom
            re: () =>  ChunkSizePx.width  / zoom() / resolution(),
            im: () => -ChunkSizePx.height / zoom() / resolution()
        },
        canvasConfig = S<ICanvasConfig>(() => ({
            chunkDelta: {
                re: chunkDelta.re(),
                im: chunkDelta.im()
            },
            origin: {
                re: origin.re(),
                im: origin.im()
            }
        })),
        rect = RectCalculations({
            canvasSizeBrowserPx,
            resolution,
            center,
            origin,
            chunkDelta
        });

    return {
        canvasSizeBrowserPx,
        resolution,
        zoom,
        center,
        origin,
        chunkDelta,
        canvasConfig,
        rect,
        currentOpts,
        updateOpts
    };

    function currentOpts() : CanvasMgrOptions {
        return {
            center: {
                re: center.re(),
                im: center.im()
            },
            zoom: zoom(),
            resolution: resolution()
        };
    }

    function updateOpts(opts : CanvasMgrOptions) {
        S.freeze(() => S.sample(() => {
            center.re(opts.center.re);
            center.im(opts.center.im);
            zoom(opts.zoom);
            resolution(opts.resolution);
        }));
    }
}

export interface ComplexSignals {
    re : () => number;
    im : () => number;
}

// Responsible for computing the current ICanvasRect
export type RectCalculations = ReturnType<typeof RectCalculations>;
export function RectCalculations({
    canvasSizeBrowserPx,
    resolution,
    center,
    origin,
    chunkDelta
} : {
    canvasSizeBrowserPx : {
        width  : () => number | null,
        height : () => number | null
    },
    resolution : () => number,
    center : ComplexSignals,
    origin : ComplexSignals,
    chunkDelta : ComplexSignals
}) {
    const
        // Size of canvas in (possibly fractional) logical px
        canvasSizeLogicalPx = {
            width:  () => canvasSizeBrowserPx.width()  === null ? null : canvasSizeBrowserPx.width()!  * resolution(),
            height: () => canvasSizeBrowserPx.height() === null ? null : canvasSizeBrowserPx.height()! * resolution()
        },
        // center - origin in (possibly fractional) chunks
        centerFromOriginChunks = {
            re: () => (center.re() - origin.re()) / chunkDelta.re(),
            im: () => (center.im() - origin.im()) / chunkDelta.im()
        },
        // origin - top left of canvas in (possibly fractional) logical px
        originOffsetPx = {
            x: () => canvasSizeLogicalPx.width()  === null ? null : -centerFromOriginChunks.re() * ChunkSizePx.width  + canvasSizeLogicalPx.width()!  / 2,
            y: () => canvasSizeLogicalPx.height() === null ? null : -centerFromOriginChunks.im() * ChunkSizePx.height + canvasSizeLogicalPx.height()! / 2
        },
        // top left of displayed canvas, specified in chunks from the origin
        topLeftChunks = {
            re: () => originOffsetPx.x() === null ? null : -originOffsetPx.x()! / ChunkSizePx.width,
            im: () => originOffsetPx.y() === null ? null : -originOffsetPx.y()! / ChunkSizePx.height
        },
        // bottom right of displayed canvas, specified in chunks from the origin
        bottomRightChunks = {
            re: () => topLeftChunks.re() === null || canvasSizeLogicalPx.width()  === null ? null :
                topLeftChunks.re()! + canvasSizeLogicalPx.width()!  / ChunkSizePx.width,
            im: () => topLeftChunks.im() === null || canvasSizeLogicalPx.height() === null ? null :
                topLeftChunks.im()! + canvasSizeLogicalPx.height()! / ChunkSizePx.height
        },
        // Current canvas rect, specified in chunks.
        // Essentially, round up the size of the canvas in browser px to the nearest whole chunk.
        canvasRect = S<ICanvasRect | null>(() => {
            if (topLeftChunks.re() === null || topLeftChunks.im() === null || bottomRightChunks.re() === null || bottomRightChunks.im() === null) return null;
            const
                topLeft = {
                    re: Math.floor(topLeftChunks.re()!),
                    im: Math.floor(topLeftChunks.im()!)
                };

            return {
                topLeft,
                widthChunks:  Math.ceil(bottomRightChunks.re()!) - topLeft.re,
                heightChunks: Math.ceil(bottomRightChunks.im()!) - topLeft.im
            };
        });

    return {
        canvasSizeLogicalPx,
        originOffsetPx,
        canvasRect
    };
}
