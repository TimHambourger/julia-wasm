import { RGB } from './rgb';

/**
 * A function that maps from a magnitude in the range 0.0 to 1.0, with 0
 * meaning escaped immediately and 1 meaning hadn't escaped within max iters,
 * to a color value in the range 0 to 255.
 */
export type ColorChannelMapper = (magnitude : number) => number;

export interface Colorizer {
    r : ColorChannelMapper;
    g : ColorChannelMapper;
    b : ColorChannelMapper;
}

/**
 * Color Julia set by linearly interpolating the provided colors.
 * @param included The color to use for points belonging to the Julia set
 * @param excluded The color to use for points maximally far from the Julia set.
 * In theory, this color will never actually be reached, just approached asymptotically.
 */
export function linearFade(included : RGB, excluded : RGB) : Colorizer {
    return {
        r: m => Math.round(m * included.r + (1 - m) * excluded.r),
        g: m => Math.round(m * included.g + (1 - m) * excluded.g),
        b: m => Math.round(m * included.b + (1 - m) * excluded.b)
    };
}
