import S from 's-js';
import * as Surplus from 'surplus';
import { App } from './app';

export const SettingsView = ({ app } : { app : App }) =>
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

const ZoomButtons = ({ app } : { app : App }) =>
    <div class="zoom-buttons">
        <span class="zoom-btn" onClick={() => app.canvasMgr.zoom(app.canvasMgr.zoom() * 1.1)}>+</span>
        <span class="zoom-btn" onClick={() => app.canvasMgr.zoom(app.canvasMgr.zoom() * 0.9)}>-</span>
    </div>;