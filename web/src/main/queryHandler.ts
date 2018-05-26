import { IComplex } from '../shared/IComplex';
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
        cRe = params.get('c_re') ? +params.get('c_re')! : null,
        cIm = params.get('c_im') ? +params.get('c_im')! : null,
        ctrRe = params.get('ctr_re') ? +params.get('ctr_re')! : null,
        ctrIm = params.get('ctr_im') ? +params.get('ctr_im')! : null,
        zoom = params.get('zoom') ? +params.get('zoom')! : null,
        colorIn = params.get('color_in') ? RGB.parse(params.get('color_in')!) : null,
        colorOut = params.get('color_out') ? RGB.parse(params.get('color_out')!) : null,
        res = params.get('res') ? +params.get('res')! : null,
        iter = params.get('iter') ? +params.get('iter')! : null,
        rad = params.get('rad') ? +params.get('rad')! : null;

    return {
        canvas: {
            center: {
                re: ctrRe !== null ? ctrRe : undefined,
                im: ctrIm !== null ? ctrIm : undefined
            },
            zoom: zoom !== null && zoom > 0 ? zoom : undefined,
            resolution: res !== null && res > 0 ? res : undefined
        },
        escapeTime: {
            c: {
                re: cRe !== null ? cRe : undefined,
                im: cIm !== null ? cIm : undefined
            },
            maxIter: iter !== null && iter > 0 ? iter : undefined,
            escapeRadius: rad !== null && rad > 0 ? rad : undefined
        },
        imager: {
            includedColor: colorIn || undefined,
            excludedColor: colorOut || undefined
        }
    };
}

/**
 * Format the query string for the given App options
 * @returns The formatted query string without leading '?'
 */
export function formatQueryString(opts : AppOptions) {
    const params = new URLSearchParams();

    params.set('c_re', '' + opts.escapeTime.c.re);
    params.set('c_im', '' + opts.escapeTime.c.im);
    params.set('ctr_re', '' + opts.canvas.center.re);
    params.set('ctr_im', '' + opts.canvas.center.im);
    params.set('zoom', '' + opts.canvas.zoom);
    params.set('color_in', opts.imager.includedColor.toString({ hideHash: true }));
    params.set('color_out', opts.imager.excludedColor.toString({ hideHash: true }));
    params.set('res', '' + opts.canvas.resolution);
    params.set('iter', '' + opts.escapeTime.maxIter);
    params.set('rad', '' + opts.escapeTime.escapeRadius);

    return params.toString();
}
