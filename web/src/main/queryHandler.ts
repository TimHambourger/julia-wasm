import { IComplex } from '../shared/IComplex';
import { CanvasMgrOptions } from './canvasMgr';
import { EscapeTimeRunnerOptions } from './runner';
import { ImagerOptions } from './imager';
import { RGB } from './colorHandling/rgb';
import { AppOptionsPartial, AppOptions } from './app';

/**
 * Parse query string into App options
 * @param query The query string, with or without leading '?'
 */
export function parseQueryString(query : string) : AppOptionsPartial {
    const
        params = new URLSearchParams(query),
        c = params.get('c') ? parseComplex(params.get('c')!) : null,
        ctr = params.get('ctr') ? parseComplex(params.get('ctr')!) : null,
        zoom = params.get('zoom') ? +params.get('zoom')! : null,
        colorIn = params.get('color_in') ? RGB.parse(params.get('color_in')!) : null,
        colorOut = params.get('color_out') ? RGB.parse(params.get('color_out')!) : null,
        res = params.get('res') ? +params.get('res')! : null,
        iter = params.get('iter') ? +params.get('iter')! : null,
        rad = params.get('rad') ? +params.get('rad')! : null;

    return {
        canvas: {
            center: ctr || undefined,
            zoom: zoom !== null && zoom > 0 ? zoom : undefined,
            resolution: res !== null && res > 0 ? res : undefined
        },
        escapeTime: {
            c: c || undefined,
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

    params.set('c', formatComplex(opts.escapeTime.c.re, opts.escapeTime.c.im));
    params.set('ctr', formatComplex(opts.canvas.center.re, opts.canvas.center.im));
    params.set('zoom', '' + opts.canvas.zoom);
    params.set('color_in', opts.imager.includedColor.toString({ hideHash: true }));
    params.set('color_out', opts.imager.excludedColor.toString({ hideHash: true }));
    params.set('res', '' + opts.canvas.resolution);
    params.set('iter', '' + opts.escapeTime.maxIter);
    params.set('rad', '' + opts.escapeTime.escapeRadius);

    return params.toString();
}

function formatComplex(re : number, im : number) {
    return re === 0 && im === 0
        ? '0'
        : im === 0
            ? formatRe(re)
            : re === 0
                ? formatIm(im)
                : formatRe(re) + (im > 0 ? '+' : '') + formatIm(im);
}

function formatRe(re : number) {
    return '' + re;
}

function formatIm(im : number) {
    return (im < 0 ? '-' : '') + (Math.abs(im) !== 1 ? '' + Math.abs(im) : '') + 'i';
}

// TODO: These regexes could be made more permissive.
// E.g. they don't allow insignificant white space, they require
// real portions (if any) to be listed before imaginary portions (if any),
// and they disallow +- characters in exponential notation, such as
// 1e+25 or 1e-25. This last restriction also means parse and foramt
// aren't perfectly symmetrical for large numbers.
const
    PURE_REAL = /^[+-]?[^+i-]+$/,
    PURE_IMAGINARY = /^([+-]?)([^+i-]*)i$/i,
    COMPLEX = /^([+-]?[^+i-]+)(\+|-|\+-)([^+i-]*)i$/i;

function parseComplex(str : string) : IComplex | null {
    const pureRe = str.match(PURE_REAL);

    if (pureRe) {
        const re = +pureRe[0];
        return isNaN(re) ? null : { re, im: 0 };
    }

    const pureIm = str.match(PURE_IMAGINARY);

    if (pureIm) {
        const im = +(pureIm[1] + (pureIm[2] || '1'));
        return isNaN(im) ? null : { re: 0, im };
    }

    const complex = str.match(COMPLEX);

    if (complex) {
        const
            re = +complex[1],
            signIm = complex[2] === '+' ? 1 : -1,
            im = signIm * +(complex[3] || '1');

        if (isNaN(re) || isNaN(im)) return null;

        return { re, im };
    }

    return null;
}
