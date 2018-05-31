import S, { DataSignal } from 's-js';
import * as Surplus from 'surplus';
import * as cx from 'classnames';
import { ChunkSizePx } from './canvasMgr';
import { App } from './app';

export const AppView = ({ app, mounted } : { app : App, mounted : () => boolean }) =>
    <div class="app">
        <Settings app={app} />
        <Canvas app={app} mounted={mounted} />
    </div>;

let Settings = ({ app } : { app : App }) =>
    <div class="settings">
        <div class="setting setting-c">
            <label class="setting-label">c</label>
            <input
                value={app.runner.c.re()}
                onChange={e => app.runner.c.re(+e.currentTarget.value)}
            />
            {' + '}
            <input
                value={app.runner.c.im()}
                onChange={e => app.runner.c.im(+e.currentTarget.value)}
            />
            {' i'}
        </div>
        <div class="setting setting-max-iter">
            <label class="setting-label">Max. iter.</label>
            <input
                value={app.runner.maxIter()}
                onChange={e => app.runner.maxIter(+e.currentTarget.value)}
            />
        </div>
        <div class="setting setting-escape-radius">
            <label class="setting-label">Escape Radius</label>
            <input
                value={app.runner.escapeRadius()}
                onChange={e => app.runner.escapeRadius(+e.currentTarget.value)}
            />
        </div>
        <ZoomButtons app={app} />
    </div>;

let ZoomButtons = ({ app } : { app : App }) =>
    <div class="zoom-buttons">
        <span class="zoom-btn" onClick={() => app.canvasMgr.zoom(1.1)}>+</span>
        <span class="zoom-btn" onClick={() => app.canvasMgr.zoom(0.9)}>-</span>
    </div>;

let Canvas = ({ app, mounted } : { app : App, mounted : () => boolean }) => {
    const panning = S.value(false);
    return (
        <canvas
            class={cx('julia-canvas', { panning: panning() })}
            fn0={reportsSizing(app, mounted)}
            fn1={rendersJuliaImage(app)}
            fn2={isDraggable(app, panning)}
            fn3={isZoomable(app)}
        />
    );
};

let reportsSizing = (app : App, mounted : () => boolean) => (canvas : HTMLCanvasElement) => {
    if (mounted()) {
        updateCanvasMgrSizing();

        window.addEventListener('resize', updateCanvasMgrSizing);
        S.cleanup(() => window.removeEventListener('resize', updateCanvasMgrSizing));
    }

    function updateCanvasMgrSizing() {
        const rect = canvas.getBoundingClientRect();
        app.canvasMgr.canvasSizeBrowserPx.width(rect.width);
        app.canvasMgr.canvasSizeBrowserPx.height(rect.height);
    }
};

let rendersJuliaImage = (app : App) => (canvas : HTMLCanvasElement) => {
    // Setting a canvas's width or height properties clears the canvas.
    // So we need to redraw the Julia image after any change to the canvas's logical size.
    // That's why we set width and height imperatively here, rather than using width and
    // height attributes in the <canvas ... /> jsx element above. The surplus-generated computations
    // for attributes don't give the needed control over timing, and lead to the canvas getting cleared
    // occasionally during resizing.
    if (app.canvasMgr.canvasSizeLogicalPx.width()  !== null) canvas.width  = app.canvasMgr.canvasSizeLogicalPx.width()!;
    if (app.canvasMgr.canvasSizeLogicalPx.height() !== null) canvas.height = app.canvasMgr.canvasSizeLogicalPx.height()!;

    S(() => {
        const
            ctx = canvas.getContext('2d')!,
            originOffsetPx = {
                x: app.canvasMgr.originOffsetPx.x(),
                y: app.canvasMgr.originOffsetPx.y()
            },
            canvasRect = app.canvasMgr.canvasRect();

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
                    const imageData = app.imager.imageData().get(chunkId)();

                    if (imageData) ctx.putImageData(imageData, topLeftCanvasCoords.x, topLeftCanvasCoords.y);
                    else ctx.clearRect(topLeftCanvasCoords.x, topLeftCanvasCoords.y, ChunkSizePx.width, ChunkSizePx.height);
                });
            }
        }
    });
};

let isDraggable = (app : App, panning : DataSignal<boolean>) => (canvas : HTMLCanvasElement) => {
    let lastClientX = 0, lastClientY = 0;

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
                app.canvasMgr.pan(lastClientX - e.clientX, lastClientY - e.clientY);
                lastClientX = e.clientX;
                lastClientY = e.clientY;
            }
        },
        mouseUp = () => panning(false);

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
    ZOOM_FRAME_RATE_MS = 10;

let isZoomable = (app : App) => (canvas : HTMLCanvasElement) => {
    let device : 'wheel' | 'trackpad' | undefined,
        delta = 0,
        frameTimeout : number | undefined;

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
                app.canvasMgr.zoom(scale);
            } finally {
                device = undefined;
                delta = 0;
                frameTimeout = undefined;
            }
        };

    canvas.addEventListener('wheel', onMouseWheel);
    S.cleanup(() => canvas.removeEventListener('wheel', onMouseWheel));
};
