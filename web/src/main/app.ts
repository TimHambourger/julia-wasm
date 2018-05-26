import S from 's-js';
import { CanvasMgr, CanvasMgrOptions } from './canvasMgr';
import { EscapeTimeRunner, EscapeTimeRunnerOptions } from './runner';
import { Imager, ImagerOptions } from './imager';
import { RGB } from './colorHandling/rgb';

export interface AppOptions {
    canvas : CanvasMgrOptions;
    escapeTime : EscapeTimeRunnerOptions;
    imager : ImagerOptions;
}

// Partial application just goes two levels deep.
export type AppOptionsPartial = {
    [K in keyof AppOptions]? : Partial<AppOptions[K]>;
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

function applyDefaults(opts : AppOptionsPartial) : AppOptions {
    const
        canvasOpts = opts.canvas || {},
        escapeTimeOpts = opts.escapeTime || {},
        imagerOpts = opts.imager || {};
    return {
        canvas: {
            center: canvasOpts.center !== undefined ? canvasOpts.center : CANVAS_DEFAULTS.center,
            zoom: canvasOpts.zoom !== undefined ? canvasOpts.zoom : CANVAS_DEFAULTS.zoom,
            resolution: canvasOpts.resolution !== undefined ? canvasOpts.resolution : CANVAS_DEFAULTS.resolution
        },
        escapeTime: {
            c: escapeTimeOpts.c !== undefined ? escapeTimeOpts.c : ESCAPE_TIME_DEFAULTS.c,
            maxIter: escapeTimeOpts.maxIter !== undefined ? escapeTimeOpts.maxIter : ESCAPE_TIME_DEFAULTS.maxIter,
            escapeRadius: escapeTimeOpts.escapeRadius !== undefined ? escapeTimeOpts.escapeRadius : ESCAPE_TIME_DEFAULTS.escapeRadius
        },
        imager: {
            includedColor: imagerOpts.includedColor !== undefined ? imagerOpts.includedColor : IMAGER_DEFAULTS.includedColor,
            excludedColor: imagerOpts.excludedColor !== undefined ? imagerOpts.excludedColor : IMAGER_DEFAULTS.excludedColor
        }
    };
}

export type App = ReturnType<typeof App>;
export function App(workerUrl : string, opts : AppOptionsPartial) {
    const
        { canvas: canvasMgrOpts, escapeTime: escapeTimeOpts, imager: imagerOpts } = applyDefaults(opts),
        canvasMgr = CanvasMgr(canvasMgrOpts),
        runner = EscapeTimeRunner(canvasMgr, workerUrl, escapeTimeOpts),
        imager = Imager(runner, imagerOpts);

    return {
        canvasMgr,
        runner,
        imager,
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

    function updateOpts(opts : AppOptionsPartial) {
        const effective = applyDefaults(opts);
        S.freeze(() => {
            canvasMgr.updateOpts(effective.canvas);
            runner.updateOpts(effective.escapeTime);
            imager.updateOpts(effective.imager);
        });
    }
}
