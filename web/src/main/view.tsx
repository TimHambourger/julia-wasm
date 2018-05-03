import S from 's-js';
import * as Surplus from 'surplus';
import { App, ChunkPixelSize } from './model';

export const AppView = ({ app } : { app : App }) =>
    <div class="app">
        <Settings app={app} />
        <Canvas app={app} />
    </div>;

let Settings = ({ app } : { app : App }) =>
    <div class="settings">
        <span class="setting-c">
            <label>c</label>
            <input
                value={app.escapeTime.c.re()}
                onChange={e => app.escapeTime.c.re(+e.currentTarget.value)}
            />
            {' + '}
            <input
                value={app.escapeTime.c.im()}
                onChange={e => app.escapeTime.c.im(+e.currentTarget.value)}
            />
            i
        </span>
        <span class="setting-max-iter">
            <label>Max. iter.</label>
            <input
                value={app.escapeTime.maxIter()}
                onChange={e => app.escapeTime.maxIter(+e.currentTarget.value)}
            />
        </span>
        <span class="setting-escape-radius">
            <label>Escape Radius</label>
            <input
                value={app.escapeTime.escapeRadius()}
                onChange={e => app.escapeTime.escapeRadius(+e.currentTarget.value)}
            />
        </span>
    </div>;

let Canvas = ({ app } : { app : App }) =>
    <canvas
        fn={renderJuliaImage(app)}
        width={app.canvas.chunksWidth() * ChunkPixelSize.width}
        height={app.canvas.chunksHeight() * ChunkPixelSize.height}
    />;

let renderJuliaImage = (app : App) => (canvas : HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;

    for (let row = 0; row < app.canvas.chunksWidth(); row++) {
        for (let col = 0; col < app.canvas.chunksHeight(); col++) {
            // Each canvas chunk gets its own computation that renders that chunk
            S(() => {
                const
                    z = {
                        re: app.canvas.reLeft() + col * app.canvas.deltaRe() / app.canvas.chunksWidth(),
                        // reverse y/imaginary axis
                        im: app.canvas.imBottom() + app.canvas.deltaIm() - row * app.canvas.deltaIm() / app.canvas.chunksHeight()
                    },
                    imageData = app.imageData().get(z)();

                if (imageData) ctx.putImageData(imageData, col * ChunkPixelSize.width, row * ChunkPixelSize.height);
                else ctx.clearRect(col * ChunkPixelSize.width, row * ChunkPixelSize.height, ChunkPixelSize.width, ChunkPixelSize.height);
            });
        }
    }
};
