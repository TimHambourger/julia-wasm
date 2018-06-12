## Under Construction...

# Julia WASM
Explore [Julia sets](https://en.wikipedia.org/wiki/Julia_set) in the browser. Powered by Rust, WebAssembly, and [Surplus](https://github.com/adamhaile/surplus).

## Features
* Pan, zoom, resize.
* Iterate on `z = z^2 + c` for any c.
* Refine parameters and colors.
* Iteration performed by Web Assembly running in a Web Worker.

## How Do I View This?
This repository includes a /dist/release/ folder. Clone or download this repo. Then open /dist/release/index.html directly from your filesystem, or else serve /dist/release/ over HTTP.

## Browser Support
For sure modern Chrome and Firefox. Probably wider than that. Better support matrix coming soon...

## Planned Improvements
* Support more functions.
* Possibly support [Mandelbrot sets](https://en.wikipedia.org/wiki/Mandelbrot_set).
* Memory improvements (usage currently rises gradually due to memory pooling).

## How To Build from Source
Coming soon...

-----
&copy; Tim Hambourger, 2018. MIT License.
