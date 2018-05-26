import S from 's-js';
import * as Surplus from 'surplus';
import { ChunkSizePx } from './canvasMgr';
import { App } from './app';

export const AppView = ({ app, mounted } : { app : App, mounted : () => boolean }) =>
    <div class="app">
        <Settings app={app} />
        <Canvas app={app} mounted={mounted} />
    </div>;

let Settings = ({ app } : { app : App }) =>
    <div class="settings">
        <span class="setting-c">
            <label>c</label>
            <input
                value={app.runner.c.re()}
                onChange={e => app.runner.c.re(+e.currentTarget.value)}
            />
            {' + '}
            <input
                value={app.runner.c.im()}
                onChange={e => app.runner.c.im(+e.currentTarget.value)}
            />
            i
        </span>
        <span class="setting-max-iter">
            <label>Max. iter.</label>
            <input
                value={app.runner.maxIter()}
                onChange={e => app.runner.maxIter(+e.currentTarget.value)}
            />
        </span>
        <span class="setting-escape-radius">
            <label>Escape Radius</label>
            <input
                value={app.runner.escapeRadius()}
                onChange={e => app.runner.escapeRadius(+e.currentTarget.value)}
            />
        </span>
        <ZoomButtons app={app} />
    </div>;

let ZoomButtons = ({ app } : { app : App }) =>
    <div>
        <span onClick={() => app.canvasMgr.zoom({ re: 1.1, im: 1.1 })}>+</span>
        <span onClick={() => app.canvasMgr.zoom({ re: 0.9, im: 0.9 })}>-</span>
    </div>;

let Canvas = ({ app, mounted } : { app : App, mounted : () => boolean }) =>
    <canvas
        fn0={reportsSizing(app, mounted)}
        fn1={rendersJuliaImage(app)}
        // We'll use logical px for our canvas coordinates
        width={app.canvasMgr.canvasSizeLogicalPx.width() || undefined}
        height={app.canvasMgr.canvasSizeLogicalPx.height() || undefined}
        style={{
            // TODO: Dynamic sizing based on screen size
            width: '400px',
            height: '400px'
        }}
    />;

let reportsSizing = (app : App, mounted : () => boolean) => (canvas : HTMLCanvasElement) => {
    if (mounted()) {
        updateCanvasMgrSizing();

        let timeout : number | null = null;
        const onresize = () => {
            if (timeout !== null) clearTimeout(timeout);
            timeout = setTimeout(updateCanvasMgrSizing, 150);
        };
        window.addEventListener('resize', onresize);
        S.cleanup(() => window.removeEventListener('resize', onresize));
    }

    function updateCanvasMgrSizing() {
        const rect = canvas.getBoundingClientRect();
        app.canvasMgr.canvasSizeBrowserPx.width(rect.width);
        app.canvasMgr.canvasSizeBrowserPx.height(rect.height);
    }
};

let rendersJuliaImage = (app : App) => (canvas : HTMLCanvasElement) => {
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
};
