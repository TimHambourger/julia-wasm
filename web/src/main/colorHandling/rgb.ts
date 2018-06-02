const
    RGBColor = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i,
    RRGGBBColor = /^#?([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])$/i;

export class RGB {
    // All numbers from 0 to 255
    constructor(public r : number, public g : number, public b : number) {}

    isValid() {
        return 0 <= this.r && this.r <= 255 && 0 <= this.g && this.g <= 255 && 0 <= this.b && this.b <= 255;
    }

    toString(opts : { hideHash? : boolean } = {}) {
        return this.isValid() ?
            (opts.hideHash ? '' : '#') + (toHex(this.r) + toHex(this.g) + toHex(this.b)).toLowerCase() :
            'INVALID';
    }

    /**
     * Parse a string in #RGB or #RRGGBB format into an RGB color.
     * If input is invalid, returns null.
     * @param str A string in #RGB or #RRGGBB format.
     */
    static parse(str : string) {
        const RGBMatch = str.match(RGBColor);
        if (RGBMatch) {
            return new RGB(
                // Concatenate each character with itself
                parseHex(RGBMatch[1] + RGBMatch[1]),
                parseHex(RGBMatch[2] + RGBMatch[2]),
                parseHex(RGBMatch[3] + RGBMatch[3])
            );
        }

        const RRGGBBMatch = str.match(RRGGBBColor);
        if (RRGGBBMatch) {
            return new RGB(
                parseHex(RRGGBBMatch[1]),
                parseHex(RRGGBBMatch[2]),
                parseHex(RRGGBBMatch[3])
            );
        }

        return null;
    }

    static eq(rgb1 : RGB, rgb2 : RGB) {
        return rgb1.r === rgb2.r && rgb1.g === rgb2.g && rgb1.b === rgb2.b;
    }

    static invalid() {
        return new RGB(NaN, NaN, NaN);
    }
}

function parseHex(str : string) : number {
    return parseInt(str, 16);
}

function toHex(num : number) : string {
    return ('00' + num.toString(16)).substr(-2);
}
