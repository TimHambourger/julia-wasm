import S from 's-js';
import { MemoryPool } from '../shared/memoryPool';
import { ChunkSizePx } from './canvasMgr';
import { EscapeTimeRunner } from './runner';
import { RGB } from './colorHandling/rgb';
import { linearFade } from './colorHandling/colorizers';

export interface ImagerOptions {
    includedColor : RGB;
    excludedColor : RGB;
}

// Imager translates the escape time data from EscapeTimeRunner into image data that can be rendered to an HTML canvas.
export type Imager = ReturnType<typeof Imager>;
export function Imager(runner : EscapeTimeRunner, opts : ImagerOptions) {
    const
        includedColor = S.value(opts.includedColor, RGB.eq),
        excludedColor = S.value(opts.excludedColor, RGB.eq),
        // TODO: Support other color functions, say from an enum?
        colorizer = S(() => linearFade(includedColor(), excludedColor())),
        // ImageData is 4 bytes per logical pixel
        pool = new MemoryPool(ChunkSizePx.width * ChunkSizePx.height * 4),
        imageData = S(() => {
            const data = runner.resultData().map<ImageData | null>((chunk, chunkId, prevImage) => {
                if (!chunk) {
                    // Recycle previous image if chunk is being set to null
                    if (prevImage) pool.push(prevImage.data.buffer);
                    return null;
                }

                const
                    _colorizer = colorizer(),
                    maxIter = runner.maxIter(),
                    // Modify previous image in place if we have one, otherwise acquire one from the pool
                    imageChunk = prevImage ? prevImage.data : new Uint8ClampedArray(pool.acquire());

                for (let i = 0; i / 4 < chunk.length && i < imageChunk.length; i += 4) {
                    const magnitude = chunk[i / 4] / maxIter;
                    imageChunk[i]     = _colorizer.r(magnitude);
                    imageChunk[i + 1] = _colorizer.g(magnitude);
                    imageChunk[i + 2] = _colorizer.b(magnitude);
                    imageChunk[i + 3] = 255;
                }

                return new ImageData(imageChunk, ChunkSizePx.width, ChunkSizePx.height);
            }, () => null);

            // Recycle buffers when constructing a new mapped bundle
            S.cleanup(() => data.crack().forEach(chunk => {
                chunk && pool.push(chunk.data.buffer);
            }));

            return data;
        });

    return {
        includedColor,
        excludedColor,
        imageData,
        currentOpts,
        updateOpts
    };

    function currentOpts() : ImagerOptions {
        return {
            includedColor: includedColor(),
            excludedColor: excludedColor()
        };
    }

    function updateOpts(opts : ImagerOptions) {
        S.freeze(() => {
            includedColor(opts.includedColor);
            excludedColor(opts.excludedColor);
        });
    }
}
