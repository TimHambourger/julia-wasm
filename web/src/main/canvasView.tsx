import S, { DataSignal } from 's-js';
import * as Surplus from 'surplus';
import * as cx from 'classnames';
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
            fn1={rendersJuliaImage(app.imager.imageData, drafts.rect)}
            fn2={isDraggable(app, drafts, panning)}
            fn3={isZoomable(drafts)}
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
        resolution = () => ChunkSizePx.width  / zoom() / app.canvasMgr.chunkDelta.re(),
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

const rendersJuliaImage = (imageData : () => IBundle<ImageData | null>, rect : RectCalculations) => (canvas : HTMLCanvasElement) => {
    // Setting a canvas's width or height properties clears the canvas.
    // So we need to redraw the Julia image after any change to the canvas's logical size.
    // That's why we set width and height imperatively here, rather than using width and
    // height attributes in the <canvas ... /> jsx element above. The surplus-generated computations
    // for attributes don't give the needed control over timing, and lead to the canvas getting cleared
    // occasionally during resizing.
    if (rect.canvasSizeLogicalPx.width()  !== null) canvas.width  = rect.canvasSizeLogicalPx.width()!;
    if (rect.canvasSizeLogicalPx.height() !== null) canvas.height = rect.canvasSizeLogicalPx.height()!;

    S(() => {
        const
            ctx = canvas.getContext('2d')!,
            originOffsetPx = {
                x: rect.originOffsetPx.x(),
                y: rect.originOffsetPx.y()
            },
            canvasRect = rect.canvasRect();

        if (originOffsetPx.x === null || originOffsetPx.y === null || !canvasRect) return;

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
                    const _imageData = imageData().get(chunkId)();

                    if (_imageData) ctx.putImageData(_imageData, topLeftCanvasCoords.x, topLeftCanvasCoords.y);
                    else ctx.clearRect(topLeftCanvasCoords.x, topLeftCanvasCoords.y, ChunkSizePx.width, ChunkSizePx.height);
                });
            }
        }
    });
};

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
    ZOOM_FRAME_RATE_MS = 10,
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
                // For reasons I don't yet understand, drafting the zoom and scheduling an async commit
                // works great when zooming in, but ends up looking slow and jittery when zooming out.
                // So for now, commit immediately when zooming out, meaning we'll reset image data and clear canvas.
                if (scale < 1) drafts.zoom.commit();
                else {
                    if (commitTimeout !== undefined) clearTimeout(commitTimeout);
                    commitTimeout = setTimeout(() => drafts.zoom.commit(), ZOOM_UPDATE_DELAY_MS);
                }
            }
        };

    canvas.addEventListener('wheel', onMouseWheel);
    S.cleanup(() => canvas.removeEventListener('wheel', onMouseWheel));
};
