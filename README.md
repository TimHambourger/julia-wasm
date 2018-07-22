## Under Construction...

# Julia WASM
Explore [Julia sets](https://en.wikipedia.org/wiki/Julia_set) in the browser. Powered by Rust, WebAssembly, and [Surplus](https://github.com/adamhaile/surplus).

[View live](https://rawgit.com/TimHambourger/julia-wasm/master/dist/release/index.html)

## Features
* Pan, zoom, resize.
* Iterate on `z = z^2 + c` for any c.
* Refine parameters and colors.
* Iteration performed by Web Assembly running in a Web Worker.

## How To Host Locally
This repository includes a /dist/release/ directory. Serve /dist/release/ over HTTP.

Note: You'll need to use a static file server that supports application/wasm as a Content-Type header. I recommend using [serve](https://www.npmjs.com/package/serve):
```
> cd dist/release/
> serve -l 8080
```

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
