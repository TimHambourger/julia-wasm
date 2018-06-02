import S from 's-js';
import { RGB } from './colorHandling/rgb';
import { CanvasMgr } from './canvasMgr';
import { EscapeTimeRunner } from './runner';
import { Imager } from './imager';

// Additional view state to support settings panel
export type Settings = ReturnType<typeof Settings>;
export function Settings(
    canvasMgr : CanvasMgr,
    runner : EscapeTimeRunner,
    imager : Imager
) {
    const
        color = ColorSettings(imager);

    return {
        color
    };
}


export interface ColorTheme {
    name : string;
    includedColor : RGB;
    excludedColor : RGB;
}

export const ColorThemes : ColorTheme[] = [{
    name: 'Dark',
    includedColor: RGB.parse('#f00')!,
    excludedColor: RGB.parse('#000')!
}, {
    name: 'Light',
    includedColor: RGB.parse('#0df')!,
    excludedColor: RGB.parse('#fff')!
}, {
    name: 'High Contrast',
    includedColor: RGB.parse('#f9ffff')!,
    excludedColor: RGB.parse('#000007')!
}];

export type ColorSettings = ReturnType<typeof ColorSettings>;
export function ColorSettings(imager : Imager) {
    const
        theme = S.value(S.sample(() => ColorThemes.find(t =>
            RGB.eq(t.includedColor, imager.includedColor()) &&
            RGB.eq(t.excludedColor, imager.excludedColor())
        ) || null));

    S.on(theme, () => {
        if (theme()) {
            imager.includedColor(theme()!.includedColor);
            imager.excludedColor(theme()!.excludedColor);
        }
    }, undefined, true);

    return {
        theme
    };
}
