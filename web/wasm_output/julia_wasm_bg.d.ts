// Tell typescript that WASM is a real ES6 module that will export its memory.
// Needed b/c workerCore.ts needs access to the raw memory.
export const memory : WebAssembly.Memory;
