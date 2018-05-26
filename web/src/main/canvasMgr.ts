import S from 's-js';
import { IComplex } from '../shared/IComplex';
import { ICanvasConfig, ICanvasRect } from '../shared/config';

export interface CanvasMgrOptions {
    /**
     * Center of the displayed canvas in complex coordinates.
     */
    center : IComplex;
    /**
     * Bottom right - top left in complex coordinates for any given chunk.
     */
    chunkDelta : IComplex;
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
        // Ratio of logical px to browser px. Higher means more logical px per browser px.
        resolution = S.value(1.25),
        // Center of the displayed canvas in complex coordinates
        center = {
            re: S.value(opts.center.re),
            im: S.value(opts.center.im)
        },
        // Origin in the sense of WASM's Canvas struct.
        // Not necessarily the center of the displayed canvas.
        // Instead, the complex coordinates that correspond to ChunkId 0 + 0i.
        origin = {
            re: S.value(opts.center.re),
            im: S.value(opts.center.im)
        },
        // Bottom right - top left in complex coordinates for any given chunk
        chunkDelta = {
            re: S.value(opts.chunkDelta.re),
            im: S.value(opts.chunkDelta.im)
        },
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
        canvasSizeBrowserPx,
        resolution,
        canvasSizeLogicalPx,
        originOffsetPx,
        canvasConfig,
        canvasRect,
        zoom,
        pan,
        currentOpts,
        updateOpts
    };

    /**
     * Zoom the canvas relative to its center point.
     * @param scaleFactor A complex number specifying how to scale the canvas's real
     * and imaginary axes. For each axis, 1 means preserve as is, > 1 means zoom
     * in, and < 1 means zoom out.
     */
    function zoom(scaleFactor : IComplex) {
        S.freeze(() => S.sample(() => {
            // Zooming means changing the chunk delta.
            // Ironically, we need to DIVIDE by the scale factor.
            // That's b/c we want scale factors > 1 to zoom in, i.e. make the
            // delta smaller, and analogously for scale factors < 1.
            chunkDelta.re(chunkDelta.re() / scaleFactor.re);
            chunkDelta.im(chunkDelta.im() / scaleFactor.im);
            // When zooming, also go ahead and reset origin to match current center
            origin.re(center.re());
            origin.im(center.im());
        }));
    }

    /**
     * Pan the displayed canvas.
     * @param deltaBrowserPx The amount to pan specified in browser px
     */
    function pan(deltaBrowserPx : { x : number, y : number }) {
        S.freeze(() => S.sample(() => {
            center.re(center.re() + deltaBrowserPx.x * resolution() / ChunkSizePx.width  * chunkDelta.re());
            center.im(center.im() + deltaBrowserPx.y * resolution() / ChunkSizePx.height * chunkDelta.im());
        }));
    }

    function currentOpts() : CanvasMgrOptions {
        return {
            center: {
                re: center.re(),
                im: center.im()
            },
            chunkDelta: {
                re: chunkDelta.re(),
                im: chunkDelta.im()
            }
        };
    }

    function updateOpts(opts : CanvasMgrOptions) {
        S.freeze(() => S.sample(() => {
            center.re(opts.center.re);
            center.im(opts.center.im);
            chunkDelta.re(opts.chunkDelta.re);
            chunkDelta.im(opts.chunkDelta.im);
            // If chunk delta is changing, go ahead and reset origin too
            if (opts.chunkDelta.re !== chunkDelta.re() || opts.chunkDelta.im !== chunkDelta.im()) {
                origin.re(opts.center.re);
                origin.im(opts.center.im);
            }
        }));
    }
}
