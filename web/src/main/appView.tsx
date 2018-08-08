import * as Surplus from 'surplus';
import { App } from './app';
import { SettingsView } from './settingsView';
import { CanvasView } from './canvasView';

export const AppView = ({ app, mounted } : { app : App, mounted : () => boolean }) =>
    <div class="app">
        <SettingsView app={app} />
        <CanvasView app={app} mounted={mounted} />
    </div>;
