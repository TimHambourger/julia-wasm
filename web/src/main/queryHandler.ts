import { CanvasMgrOptions } from './canvasMgr';
import { EscapeTimeRunnerOptions } from './runner';
import { ImagerOptions } from './imager';
import { RGB } from './colorHandling/rgb';
import { DeepPartial, AppOptions } from './app';

/**
 * Parse query string into App options
 * @param query The query string, with or without leading '?'
 */
export function parseQueryString(query : string) : DeepPartial<AppOptions> {
    const
        params = new URLSearchParams(query),
        canvas : DeepPartial<CanvasMgrOptions> = {
            center: {
                re: params.has('center_re') ? +params.get('center_re')! : undefined,
                im: params.has('center_im') ? +params.get('center_im')! : undefined
            },
            chunkDelta: {
                re: params.has('chunk_delta_re') ? +params.get('chunk_delta_re')! : undefined,
                im: params.has('chunk_delta_im') ? +params.get('chunk_delta_im')! : undefined
            }
        },
        escapeTime : DeepPartial<EscapeTimeRunnerOptions> = {
            c: {
                re: params.has('c_re') ? +params.get('c_re')! : undefined,
                im: params.has('c_im') ? +params.get('c_im')! : undefined
            },
            maxIter: params.has('max_iter') ? +params.get('max_iter')! : undefined,
            escapeRadius: params.has('escape_radius') ? +params.get('escape_radius')! : undefined
        },
        includedColor = params.has('color_in')  ? RGB.parse(params.get('color_in')!)  : null,
        excludedColor = params.has('color_out') ? RGB.parse(params.get('color_out')!) : null,
        imager : DeepPartial<ImagerOptions> = {
            includedColor: includedColor ? includedColor : undefined,
            excludedColor: excludedColor ? excludedColor : undefined
        };

    return { canvas, escapeTime, imager };
}

/**
 * Format the query string for the given App options
 * @returns The formatted query string without leading '?'
 */
export function formatQueryString(opts : AppOptions) {
    const params = new URLSearchParams();

    params.set('center_re', '' + opts.canvas.center.re);
    params.set('center_im', '' + opts.canvas.center.im);
    params.set('chunk_delta_re', '' + opts.canvas.chunkDelta.re);
    params.set('chunk_delta_im', '' + opts.canvas.chunkDelta.im);
    params.set('c_re', '' + opts.escapeTime.c.re);
    params.set('c_im', '' + opts.escapeTime.c.im);
    params.set('max_iter', '' + opts.escapeTime.maxIter);
    params.set('escape_radius', '' + opts.escapeTime.escapeRadius);
    params.set('color_in',  '' + opts.imager.includedColor);
    params.set('color_out', '' + opts.imager.excludedColor);

    return params.toString();
}
