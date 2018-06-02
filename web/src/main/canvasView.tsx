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
    // On Chrome, using true mouse wheel, wheel deltas apparently come in multiples of this factor
    WHEEL_ZOOM_DELTA = 4.000244140625,
    // For converting btwn DOM_DELTA_LINE and DOM_DELTA_PIXEL
    PX_PER_DOM_DELTA_LINE = 40,
    ZOOM_SENSITIVITY_TRACKPAD = 1 / 300,
    ZOOM_SENSITIVITY_WHEEL = 1 / 450,
    ZOOM_FRAME_RATE_MS = 10,
    // Make sure this is bigger than ZOOM_FRAME_RATE_MS
    ZOOM_UPDATE_DELAY_MS = 60;

const isZoomable = (drafts : CanvasDrafts) => (canvas : HTMLCanvasElement) => {
    let device : 'wheel' | 'trackpad' | undefined,
        delta = 0,
        frameTimeout : number | undefined,
        commitTimeout : number | undefined;

    const
        onMouseWheel = (e : WheelEvent) => {
            e.preventDefault();
            const thisDelta = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * PX_PER_DOM_DELTA_LINE : e.deltaY;
            delta += thisDelta;

            // The idea of trying to distinguish btwn trackpad and true mouse wheel and having different sensitivities for each comes from Mapbox.
            // I've slightly adapted the logic.
            // Testing for divisibility by WHEEL_ZOOM_DELTA detects mouse wheel on Chrome.
            // Meanwhile, DOM_DELTA_LINE is a reliable test on FF, while Chrome always uses DOM_DELTA_PIXEL.
            // TODO: Is this worth it? Could instead use a fixed sensitivity factor somewhere in the middle.
            // Needs more cross-platform testing.
            if (thisDelta !== 0 && thisDelta % WHEEL_ZOOM_DELTA === 0 || e.deltaMode === WheelEvent.DOM_DELTA_LINE) device = 'wheel';
            // Small deltas are apparently characteristic of trackpad for both Chrome and FF.
            else if (thisDelta !== 0 && Math.abs(thisDelta) < 4) device = 'trackpad';

            // Chunking wheel events into discrete "frames" helps smooth over timing differences btwn platforms/browsers/devices,
            // and also gives us more chance to distinguish intentional zooms from accidental "blips".
            if (frameTimeout === undefined) frameTimeout = setTimeout(onZoomFrame, ZOOM_FRAME_RATE_MS);
            if (commitTimeout !== undefined) clearTimeout(commitTimeout);
            commitTimeout = setTimeout(() => drafts.zoom.commit(), ZOOM_UPDATE_DELAY_MS);
        },
        onZoomFrame = () => {
            // If we haven't detected device by now, base it on speed.
            device = device || (Math.abs(delta / ZOOM_FRAME_RATE_MS) > 20 ? 'wheel' : 'trackpad');

            const
                sensitivity = device === 'wheel' ? ZOOM_SENSITIVITY_WHEEL : ZOOM_SENSITIVITY_TRACKPAD,
                exp = Math.abs(sensitivity * delta),
                // Scale by sigmoid of scroll wheel delta. Use of sigmoid comes straight from Mapbox.
                // But collapse scales close to 1 to exactly 1, to prevent repainting canvas for tiny zoom changes.
                scale = exp < 0.04 ? 1 : Math.pow(2 / (1 + Math.exp(-exp)), delta <= 0 ? 1 : -1);

            try {
                drafts.zoom(drafts.zoom() * scale);
                // For reasons I don't yet understand, drafting the zoom and scheduling an async commit
                // works great when zooming in, but ends up looking slow and jittery when zooming out.
                // So for now, commit immediately when zooming out, meaning we'll reset image data and clear canvas.
                if (scale < 1) drafts.zoom.commit();
            } finally {
                device = undefined;
                delta = 0;
                frameTimeout = undefined;
            }
        };

    canvas.addEventListener('wheel', onMouseWheel);
    S.cleanup(() => canvas.removeEventListener('wheel', onMouseWheel));
};
