import * as Surplus from 'surplus';
import { RGB } from './colorHandling/rgb';
import { App } from './app';
import { ColorThemes } from './settings';

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
        <ColorSelector app={app} />
        <ZoomButtons app={app} />
    </div>;

const ZoomButtons = ({ app } : { app : App }) =>
    <div class="zoom-buttons">
        <span class="zoom-btn" onClick={() => app.canvasMgr.zoom(app.canvasMgr.zoom() * 1.1)}>+</span>
        <span class="zoom-btn" onClick={() => app.canvasMgr.zoom(app.canvasMgr.zoom() * 0.9)}>-</span>
    </div>;

const ColorSelector = ({ app } : { app : App }) =>
    <div class="color-selector">
        <div class="setting">
            <label class="setting-label">Theme</label>
            <select class="color-dropdown"
                value={app.settings.color.theme() ? ColorThemes.indexOf(app.settings.color.theme()!) : -1}
                onChange={e => app.settings.color.theme(ColorThemes[+e.currentTarget.value] || null)}
            >
                {ColorThemes.map((t, idx) =>
                    <option value={idx}>{t.name}</option>
                )}
                <option value={-1}>Custom</option>
            </select>
        </div>
        {!app.settings.color.theme() &&
            <div class="color-custom">
                <div class="setting">
                    <label class="setting-label">Color In</label>
                    <input
                        value={app.imager.includedColor().toString()}
                        onChange={e => app.imager.includedColor(RGB.parse(e.currentTarget.value) || RGB.invalid())}
                    />
                </div>
                <div class="setting">
                    <label class="setting-label">Color Out</label>
                    <input
                        value={app.imager.excludedColor().toString()}
                        onChange={e => app.imager.excludedColor(RGB.parse(e.currentTarget.value) || RGB.invalid())}
                    />
                </div>
            </div>
        }
    </div>
