import { DeepPartial, AppOptions, EscapeTimeOptions, CanvasOptions } from './model';

/**
 * Parse query string into App options
 * @param query The query string, with or without leading '?'
 */
export function parseQueryString(query : string) : DeepPartial<AppOptions> {
    const
        params = new URLSearchParams(query),
        escapeTime : DeepPartial<EscapeTimeOptions> = {
            c: {
                re: params.has('c_re') ? +params.get('c_re')! : undefined,
                im: params.has('c_im') ? +params.get('c_im')! : undefined
            },
            maxIter: params.has('max_iter') ? +params.get('max_iter')! : undefined,
            escapeRadius: params.has('escape_radius') ? +params.get('escape_radius')! : undefined
        },
        canvas : DeepPartial<CanvasOptions> = {
            topLeft: {
                re: params.has('top_left_re') ? +params.get('top_left_re')! : undefined,
                im: params.has('top_left_im') ? +params.get('top_left_im')! : undefined
            },
            bottomRight: {
                re: params.has('bottom_right_re') ? +params.get('bottom_right_re')! : undefined,
                im: params.has('bottom_right_im') ? +params.get('bottom_right_im')! : undefined
            }
        };

    return { escapeTime, canvas };
}

/**
 * Format the query string for the given App options
 * @returns The formatted query string without leading '?'
 */
export function formatQueryString(opts : AppOptions) {
    const params = new URLSearchParams();

    params.set('c_re', '' + opts.escapeTime.c.re);
    params.set('c_im', '' + opts.escapeTime.c.im);
    params.set('max_iter', '' + opts.escapeTime.maxIter);
    params.set('escape_radius', '' + opts.escapeTime.escapeRadius);
    params.set('top_left_re', '' + opts.canvas.topLeft.re);
    params.set('top_left_im', '' + opts.canvas.topLeft.im);
    params.set('bottom_right_re', '' + opts.canvas.bottomRight.re);
    params.set('bottom_right_im', '' + opts.canvas.bottomRight.im);

    return params.toString();
}
