import { Buffer } from './wasm/julia-wasm';

// Basically, a Rust Vec<u16> represented as both an opaque Buffer object for passing
// into Rust methods and as a Uint16Array for reading in JS.
// Each call to EscapeTimeAPI.load will load one such chunk.
export interface ChunkOfWork {
    buffer : Buffer;
    view : Uint16Array;
    // Sizes in logical pixels
    width : number;
    height : number;
}
