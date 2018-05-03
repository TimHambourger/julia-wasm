export interface RGB {
    // All numbers from 0 to 255
    r : number;
    g : number;
    b : number;
}

/**
 * Color Julia set in shades of the provided color, with points in the set dark
 * and points out of the set progressively lighter.
 */
export function shadeDark(saturated : RGB) {
    // magnitude -- from 0.0 to 1.0, with 0.0 meaning escaped immediately
    // and 1.0 meaning hadn't escaped within max iters
    return (magnitude : number) => ({
        r: saturated.r * magnitude,
        g: saturated.g * magnitude,
        b: saturated.b * magnitude
    });
}

/**
 * Color Julia set in shades of the provided color, with points in the set light
 * and points out of the set progressively darker.
 */
export function shadeLight(saturated : RGB) {
    // magnitude -- from 0.0 to 1.0, with 0.0 meaning escaped immediately
    // and 1.0 meaning hadn't escaped within max iters
    return (magnitude : number) => ({
        r: saturated.r * (1 - magnitude),
        g: saturated.g * (1 - magnitude),
        b: saturated.b * (1 - magnitude)
    });
}
