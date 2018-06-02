import S from 's-js';
import { CanvasMgr, CanvasMgrOptions } from './canvasMgr';
import { EscapeTimeRunner, EscapeTimeRunnerOptions } from './runner';
import { Imager, ImagerOptions } from './imager';
import { RGB } from './colorHandling/rgb';
import { Settings } from './settings';

// NOTE: This version isn't fully general but works for what we need.
// For a fuller solution that also covers arrays, see https://stackoverflow.com/a/49936686
export type DeepPartial<T> = {
    [K in keyof T]? : DeepPartial<T[K]>;
};

export interface AppOptions {
    canvas : CanvasMgrOptions;
    escapeTime : EscapeTimeRunnerOptions;
    imager : ImagerOptions;
}

const CANVAS_DEFAULTS : CanvasMgrOptions = {
    center: {
        re: 0,
        im: 0
    },
    zoom: 150,
    resolution: 1.25
};

const ESCAPE_TIME_DEFAULTS : EscapeTimeRunnerOptions = {
    c: {
        re: 0,
        im: 0.8
    },
    maxIter: 50,
    escapeRadius: 2
};

const IMAGER_DEFAULTS : ImagerOptions = {
    includedColor: new RGB(255, 0, 0),
    excludedColor: new RGB(0, 0, 0)
};

function applyDefaults(opts : DeepPartial<AppOptions>) : AppOptions {
    const
        canvasOpts = opts.canvas || {},
        centerOpts = canvasOpts.center || {},
        escapeTimeOpts = opts.escapeTime || {},
        cOpts = escapeTimeOpts.c || {},
        imagerOpts = opts.imager || {},
        includedColorOpts = imagerOpts.includedColor || {},
        excludedColorOpts = imagerOpts.excludedColor || {};

    return {
        canvas: {
            center: {
                re: centerOpts.re !== undefined ? centerOpts.re : CANVAS_DEFAULTS.center.re,
                im: centerOpts.im !== undefined ? centerOpts.im : CANVAS_DEFAULTS.center.im
            },
            zoom: canvasOpts.zoom !== undefined ? canvasOpts.zoom : CANVAS_DEFAULTS.zoom,
            resolution: canvasOpts.resolution !== undefined ? canvasOpts.resolution : CANVAS_DEFAULTS.resolution
        },
        escapeTime: {
            c: {
                re: cOpts.re !== undefined ? cOpts.re : ESCAPE_TIME_DEFAULTS.c.re,
                im: cOpts.im !== undefined ? cOpts.im : ESCAPE_TIME_DEFAULTS.c.im
            },
            maxIter: escapeTimeOpts.maxIter !== undefined ? escapeTimeOpts.maxIter : ESCAPE_TIME_DEFAULTS.maxIter,
            escapeRadius: escapeTimeOpts.escapeRadius !== undefined ? escapeTimeOpts.escapeRadius : ESCAPE_TIME_DEFAULTS.escapeRadius
        },
        imager: {
            includedColor: new RGB(
                includedColorOpts.r !== undefined ? includedColorOpts.r : IMAGER_DEFAULTS.includedColor.r,
                includedColorOpts.g !== undefined ? includedColorOpts.g : IMAGER_DEFAULTS.includedColor.g,
                includedColorOpts.b !== undefined ? includedColorOpts.b : IMAGER_DEFAULTS.includedColor.b
            ),
            excludedColor: new RGB(
                excludedColorOpts.r !== undefined ? excludedColorOpts.r : IMAGER_DEFAULTS.excludedColor.r,
                excludedColorOpts.g !== undefined ? excludedColorOpts.g : IMAGER_DEFAULTS.excludedColor.g,
                excludedColorOpts.b !== undefined ? excludedColorOpts.b : IMAGER_DEFAULTS.excludedColor.b
            )
        }
    };
}

export type App = ReturnType<typeof App>;
export function App(workerUrl : string, opts : DeepPartial<AppOptions>) {
    const
        { canvas: canvasMgrOpts, escapeTime: escapeTimeOpts, imager: imagerOpts } = applyDefaults(opts),
        canvasMgr = CanvasMgr(canvasMgrOpts),
        runner = EscapeTimeRunner(canvasMgr, workerUrl, escapeTimeOpts),
        imager = Imager(runner, imagerOpts),
        settings = Settings(canvasMgr, runner, imager);

    return {
        canvasMgr,
        runner,
        imager,
        settings,
        currentOpts,
        updateOpts
    };

    function currentOpts() : AppOptions {
        return {
            canvas: canvasMgr.currentOpts(),
            escapeTime: runner.currentOpts(),
            imager: imager.currentOpts()
        };
    }

    function updateOpts(opts : DeepPartial<AppOptions>) {
        const effective = applyDefaults(opts);
        S.freeze(() => {
            canvasMgr.updateOpts(effective.canvas);
            runner.updateOpts(effective.escapeTime);
            imager.updateOpts(effective.imager);
        });
    }
}
