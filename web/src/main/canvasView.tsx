import S, { DataSignal } from 's-js';
import * as Surplus from 'surplus';
import * as cx from 'classnames';
import { ICanvasRect } from '../shared/config';
import { IBundle } from './lib/dataBundle';
import { draftSignal, DraftSignal } from './lib/draftSignal';
import { ChunkSizePx, RectCalculations } from './canvasMgr';
import { App } from './app';

export const CanvasView = ({ app, mounted } : { app : App, mounted : () => boolean }) => {
    const
        drafts = CanvasDrafts(app),
        panning = S.value(false);

    return (
        <canvas
            class={cx('julia-canvas', { panning: panning() })}
            fn0={reportsSizing(app, drafts, mounted)}
            fn1={rendersJuliaImage(app, drafts)}
            fn2={rendersOnZoomOut(app, drafts) as <U>(el : HTMLCanvasElement, prevBuffer : U | undefined) => any}
            fn3={isDraggable(app, drafts, panning)}
            fn4={isZoomable(drafts)}
        />
    );
};

// During transitions, we'll allow the view to "float" by having a canvas size,
// zoom, or center different from the values defined in our model layer.
// This enables smoother transitions when changing one of those values.
// However, to be able to use the image data stored in the model layer, it's essential that
// the view always use the same origin and chunkDelta as the model layer.
// Those are needed to interpret the ChunkIds used by the model layer, and therefore can't "float."
type CanvasDrafts = ReturnType<typeof CanvasDrafts>;
const CanvasDrafts = (app : App) => {
    const
        canvasSizeBrowserPx = {
            width:  draftSignal(app.canvasMgr.canvasSizeBrowserPx.width),
            height: draftSignal(app.canvasMgr.canvasSizeBrowserPx.height)
        },
        zoom   = draftSignal(app.canvasMgr.zoom),
        center = {
            re: draftSignal(app.canvasMgr.center.re),
            im: draftSignal(app.canvasMgr.center.im)
        },
        // Treat resolution as a function of our draft zoom and the model's chunkDelta.
        // NOTE: We'd expect to get the same answer if we instead used ChunkSizePx.height together with chunkDelta.im.
        // Also NOTE: We constrain the resolution to be no higher than the model layer's resolution. This is part of our
        // perf fix for the zoom out case. See rendersOnZoomOut.
        resolution = () => Math.min(Math.abs(ChunkSizePx.width  / zoom() / app.canvasMgr.chunkDelta.re()), app.canvasMgr.resolution()),
        rect = RectCalculations({
            origin: app.canvasMgr.origin,
            chunkDelta: app.canvasMgr.chunkDelta,
            canvasSizeBrowserPx,
            resolution,
            center
        });

    return {
        canvasSizeBrowserPx,
        zoom,
        center,
        resolution,
        rect
    };
}

const reportsSizing = (app : App, drafts : CanvasDrafts, mounted : () => boolean) => (canvas : HTMLCanvasElement) => {
    if (mounted()) {
        // On intial load, update model values directly
        updateCanvasMgrSizing(app.canvasMgr.canvasSizeBrowserPx);

        let timeout : number | undefined;

        const onResize = () => {
            // On resize, update draft values, then schedule an async commit
            updateCanvasMgrSizing(drafts.canvasSizeBrowserPx);
            if (timeout !== undefined) clearTimeout(timeout);
            timeout = setTimeout(commit, 50);
        };
        window.addEventListener('resize', onResize);
        S.cleanup(() => window.removeEventListener('resize', onResize));
    }

    function updateCanvasMgrSizing({ width, height } : {
        width : (val : number) => void,
        height : (val : number) => void
    }) {
        const rect = canvas.getBoundingClientRect();
        width (rect.width );
        height(rect.height);
    }

    function commit() {
        drafts.canvasSizeBrowserPx.width .commit();
        drafts.canvasSizeBrowserPx.height.commit();
    }
};

// Default render method for all cases except while zooming out.
// Zooming out gets its own specialized render method for performance reasons. See below.
const rendersJuliaImage = (app : App, drafts : CanvasDrafts) => (canvas : HTMLCanvasElement) => {
    if (drafts.zoom() < app.canvasMgr.zoom()) return;

    const
        { rect } = drafts,
        canvasSizeLogicalPx = rect.canvasSizeLogicalPx.width() === null || rect.canvasSizeLogicalPx.height() === null ? null : {
            width: rect.canvasSizeLogicalPx.width()!,
            height: rect.canvasSizeLogicalPx.height()!
        };

    if (!canvasSizeLogicalPx) return;

    // Setting a canvas's width or height properties clears the canvas.
    // So we need to redraw the Julia image after any change to the canvas's logical size.
    // That's why we set width and height imperatively here, rather than using width and
    // height attributes in the <canvas ... /> jsx element above. The surplus-generated computations
    // for attributes don't give the needed control over timing, and lead to the canvas getting cleared
    // occasionally during resizing.
    canvas.width  = canvasSizeLogicalPx.width;
    canvas.height = canvasSizeLogicalPx.height;

    const ctx = canvas.getContext('2d')!;

    S(() => {
        const
            originOffsetPx = rect.originOffsetPx.x() === null || rect.originOffsetPx.y() === null ? null : {
                x: rect.originOffsetPx.x()!,
                y: rect.originOffsetPx.y()!
            },
            canvasRect = rect.canvasRect();

        if (!originOffsetPx || !canvasRect) return;

        for (let row = 0; row < canvasRect.widthChunks; row++) {
            for (let col = 0; col < canvasRect.heightChunks; col++) {
                const
                    chunkId = {
                        re: canvasRect.topLeft.re + row,
                        im: canvasRect.topLeft.im + col
                    },
                    topLeftCanvasCoords = {
                        x: chunkId.re * ChunkSizePx.width  + originOffsetPx.x,
                        y: chunkId.im * ChunkSizePx.height + originOffsetPx.y
                    };

                // Each canvas chunk gets its own computation that renders that chunk
                S(() => {
                    const imageData = app.imager.imageData().get(chunkId)();

                    if (imageData) ctx.putImageData(imageData, topLeftCanvasCoords.x, topLeftCanvasCoords.y);
                    else ctx.clearRect(topLeftCanvasCoords.x, topLeftCanvasCoords.y, ChunkSizePx.width, ChunkSizePx.height);
                });
            }
        }
    });
};

// Specialized render method just for zooming out.
//
// This overcomes the perf limitations of renderAllChunks for this case.
// The simpler approach would be to let CanvasDrafts's resolution move freely, w/o being constrained by app.canvasMgr.resolution,
// and use renderAllChunks in all cases including zoom out.
// That'd work functionally, but it'd have poor perf on zoom out.
// The problem is that as you zoomed out, the resolution would get higher and higher, meaning we'd need more chunks to fill the canvas,
// and thus renderAllChunks would do more and more work on each zoom frame.
// What's worse, more and more of the canvas would be empty, so we'd be spending most of that time computing data for a blank canvas.
// This is the polar opposite of the zoom in case, where the more you zoom in, the lower the resolution gets and thus the less work needed
// to renderAllChunks.
//
// So instead, we cap the resolution. Then, to be able to use the model layer's existing imageData during zoom out,
// this implementation down samples from that imageData to fill the shrinking populated
// area of the canvas. This means the amount of work decreases the more you zoom out.
const rendersOnZoomOut = (app : App, drafts : CanvasDrafts) => (canvas : HTMLCanvasElement, prevBuffer : ArrayBuffer | undefined) : ArrayBuffer | undefined => {
    if (drafts.zoom() >= app.canvasMgr.zoom()) return;

    const
        { rect } = drafts,
        canvasSizeLogicalPx = rect.canvasSizeLogicalPx.width() === null || rect.canvasSizeLogicalPx.height() === null ? null : {
            width: rect.canvasSizeLogicalPx.width()!,
            height: rect.canvasSizeLogicalPx.height()!
        },
        originOffsetPx = rect.originOffsetPx.x() === null || rect.originOffsetPx.y() === null ? null : {
            x: rect.originOffsetPx.x()!,
            y: rect.originOffsetPx.y()!
        };

    if (!canvasSizeLogicalPx || !originOffsetPx) return;

    // Ditto rendersJuliaImage about setting canvas width and height
    canvas.width  = canvasSizeLogicalPx.width;
    canvas.height = canvasSizeLogicalPx.height;

    const ctx = canvas.getContext('2d')!;

    const
        // We'll shrink the entire canvasRect into a smaller target based on draft zoom
        // Ratio of full zoom to draft zoom, which we're assuming to be smaller.
        fullToDraftZoom = app.canvasMgr.zoom() / drafts.zoom(),
        targetSizePx = {
            width:  Math.floor(canvasSizeLogicalPx.width  / fullToDraftZoom),
            height: Math.floor(canvasSizeLogicalPx.height / fullToDraftZoom)
        },
        targetCoords = {
            x: Math.round((canvasSizeLogicalPx.width  - targetSizePx.width ) / 2),
            y: Math.round((canvasSizeLogicalPx.height - targetSizePx.height) / 2)
        },
        // Image data is 4 bytes per pixel
        byteLength = targetSizePx.width * targetSizePx.height * 4,
        // Re-use cached buffer if we have one
        buffer = prevBuffer && prevBuffer.byteLength >= byteLength ? prevBuffer : new ArrayBuffer(byteLength),
        targetImage = new ImageData(new Uint8ClampedArray(buffer, 0, byteLength), targetSizePx.width, targetSizePx.height);

    // Avoid subscribing to the image data. We expect zoom out to be short-lived,
    // and sampling avoids double renders in case you zoom out while the worker is still computing data.
    S.sample(() => {
        // Populate target image by down-sampling from chunk images
        const
            chunkId = { re: 0, im: 0 },
            lastChunkId = { re: undefined as number | undefined, im: undefined as number | undefined };

        // Cache fetched chunkImage and re-use as long as lastChunkId matches new chunkId.
        // This is a crucial perf optimization, otherwise we get very bogged down looking up chunks in our DataBundle.
        // The intuition is that we expect frequent runs of pixels that map to the same chunk.
        let chunkImage = null as ImageData | null;

        // Iterate target pixels. This means amount of work decreases as draft zoom decreases.
        for (let i = 0; i < targetSizePx.width * targetSizePx.height; i++) {
            const
                // Add half a pixel so we're computing from the center of each pixel
                rowPx = Math.floor(i / targetSizePx.width) + 0.5,
                colPx = i % targetSizePx.width + 0.5,
                // Identify the best source pixel for the given target pixel.
                // source{Row|Col}Px -- coords of the source pixel relative to the origin
                sourceRowPx = Math.round(fullToDraftZoom * (rowPx - targetSizePx.height / 2) + canvasSizeLogicalPx.height / 2 - originOffsetPx.y),
                sourceColPx = Math.round(fullToDraftZoom * (colPx - targetSizePx.width  / 2) + canvasSizeLogicalPx.width  / 2 - originOffsetPx.x);

            chunkId.re = Math.floor(sourceColPx / ChunkSizePx.width );
            chunkId.im = Math.floor(sourceRowPx / ChunkSizePx.height);
            chunkImage = chunkId.re === lastChunkId.re && chunkId.im === lastChunkId.im ? chunkImage : app.imager.imageData().get(chunkId)();
            lastChunkId.re = chunkId.re;
            lastChunkId.im = chunkId.im;

            if (chunkImage) {
                const
                    rowOffset = sourceRowPx - chunkId.im * ChunkSizePx.height,
                    colOffset = sourceColPx - chunkId.re * ChunkSizePx.width,
                    bufferOffset = 4 * (rowOffset * ChunkSizePx.width + colOffset);

                targetImage.data[4 * i]     = chunkImage.data[bufferOffset    ];
                targetImage.data[4 * i + 1] = chunkImage.data[bufferOffset + 1];
                targetImage.data[4 * i + 2] = chunkImage.data[bufferOffset + 2];
                targetImage.data[4 * i + 3] = chunkImage.data[bufferOffset + 3];
            } else {
                // Set alpha to 0 to clear this pixel. Don't care about r,g, or b.
                targetImage.data[4 * i + 3] = 0;
            }
        }
    });

    ctx.clearRect(0, 0, canvasSizeLogicalPx.width, canvasSizeLogicalPx.height);
    ctx.putImageData(targetImage, targetCoords.x, targetCoords.y);

    // Return buffer to cache for next zoom frame.
    return buffer;
}

const isDraggable = (app : App, drafts : CanvasDrafts, panning : DataSignal<boolean>) => (canvas : HTMLCanvasElement) => {
    let lastClientX = 0, lastClientY = 0, timeout : number | undefined;

    const
        mouseDown = (e : MouseEvent) => {
            // Avoid triggering on right click, ctrl-click, or any other modified click
            if (e.button === 0 /* Main button */ && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                panning(true);
                lastClientX = e.clientX;
                lastClientY = e.clientY;
            }
        },
        mouseMove = (e : MouseEvent) => {
            if (panning()) {
                // Note reversed directions. Moving mouse to the left moves center real coord to the RIGHT, ditto for imaginary coord.
                const
                    deltaX = lastClientX - e.clientX,
                    deltaY = lastClientY - e.clientY;

                lastClientX = e.clientX;
                lastClientY = e.clientY;

                S.freeze(() => S.sample(() => {
                    drafts.center.re(drafts.center.re() + deltaX * drafts.resolution() / ChunkSizePx.width  * app.canvasMgr.chunkDelta.re());
                    drafts.center.im(drafts.center.im() + deltaY * drafts.resolution() / ChunkSizePx.height * app.canvasMgr.chunkDelta.im());
                }));

                if (timeout === undefined) timeout = setTimeout(commit, 50);
            }
        },
        mouseUp = () => panning(false),
        commit = () => {
            timeout = undefined;
            S.freeze(() => {
                drafts.center.re.commit();
                drafts.center.im.commit();
            });
        };

    canvas.addEventListener('mousedown', mouseDown);
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup'  , mouseUp  );
    S.cleanup(() => {
        canvas.removeEventListener('mousedown', mouseDown);
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup'  , mouseUp  );
    });
};

// Constants and isZoomable logic below adapted from mapbox-gl-js, Copyright (c) 2016, Mapbox
// See https://github.com/mapbox/mapbox-gl-js/blob/0de15ab814dcd754d8923f0c1b4e7304a6b088a4/src/ui/handler/scroll_zoom.js
const
    // For converting btwn DOM_DELTA_LINE and DOM_DELTA_PIXEL
    PX_PER_DOM_DELTA_LINE = 40,
    // Linear scale factor for sensitivity. Higher means wheel gestures are more sensitive across the board.
    ZOOM_SENSITIVITY = 1 / 450,
    // Exponent to apply to sensitivity. Set to a number btwn 0 and 1 to fine-tune how sensitivity varies by gesture speed.
    ZOOM_SENSITIVITY_EXP = 0.8,
    // Threshold speed to count a gesture as intentional. We'll ignore below this.
    MIN_DELTA_PER_MS = 0.5,
    // Duration of a zoom frame
    ZOOM_FRAME_RATE_MS = 10,
    // Period of quiet before we commit zoom changes to the model layer.
    // This MUST be larger than ZOOM_FRAME_RATE_MS.
    ZOOM_UPDATE_DELAY_MS = 100;

const isZoomable = (drafts : CanvasDrafts) => (canvas : HTMLCanvasElement) => {
    let delta = 0,
        frameTimeout : number | undefined,
        commitTimeout : number | undefined;

    const
        onMouseWheel = (e : WheelEvent) => {
            // Default is to zoom the entire browser window
            e.preventDefault();

            // DOM_DELTA_LINE occurs on FF using true mouse wheel (as opposed to trackpad).
            // TODO: DOM_DELTA_PAGE? Sounds like this is Windows only and depends on mouse settings.
            delta += e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * PX_PER_DOM_DELTA_LINE : e.deltaY;

            // Chunking wheel events into discrete "frames" helps smooth over timing differences btwn platforms/browsers/devices,
            // and also gives us more chance to distinguish intentional zooms from accidental "blips".
            if (frameTimeout === undefined) frameTimeout = setTimeout(onZoomFrame, ZOOM_FRAME_RATE_MS);
            if (commitTimeout !== undefined) clearTimeout(commitTimeout);
            commitTimeout = setTimeout(() => drafts.zoom.commit(), ZOOM_UPDATE_DELAY_MS);
        },
        onZoomFrame = () => {
            const
                _delta = delta;

            delta = 0;
            frameTimeout = undefined;

            // Zooming causes a repaint of the canvas. So enforce a min delta to avoid repaints due to
            // accidental "blips".
            if (Math.abs(_delta / ZOOM_FRAME_RATE_MS) >= MIN_DELTA_PER_MS) {
                const
                    // Use modified sigmoid to calculate scale factor. Idea of using sigmoid comes from Mapbox.
                    // Adding an extra ZOOM_SENSITIVITY_EXP lets us compress the sensitivity range slightly by
                    // making fast wheel gestures slightly more sensitive and slow wheel gestures slightly less sensitive.
                    // In the extreme, if ZOOM_SENSITIVITY_EXP is set to 0, then the scale factor is constant across gesture speeds.
                    exp = Math.pow(Math.abs(ZOOM_SENSITIVITY * _delta), ZOOM_SENSITIVITY_EXP),
                    scale = Math.pow(2 / (1 + Math.exp(-exp)), _delta <= 0 ? 1 : -1);

                drafts.zoom(drafts.zoom() * scale);
            }
        };

    canvas.addEventListener('wheel', onMouseWheel);
    S.cleanup(() => canvas.removeEventListener('wheel', onMouseWheel));
};
