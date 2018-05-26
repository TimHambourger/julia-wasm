#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate julia;
extern crate num_complex;
extern crate wasm_bindgen;

use julia::{
    EscapeTimeRunner as EscapeTimeRunnerInner,
    EscapeTime as EscapeTimeInner,
    Canvas as CanvasInner,
    ChunkId,
    CanvasRect as CanvasRectInner
};
use num_complex::Complex;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Buffer(Vec<u16>);

#[wasm_bindgen]
pub struct EscapeTime(EscapeTimeInner);

#[wasm_bindgen]
pub struct Canvas(CanvasInner);

#[wasm_bindgen]
pub struct CanvasRect(CanvasRectInner);

#[wasm_bindgen]
pub struct EscapeTimeRunner {
    inner : EscapeTimeRunnerInner,
    current : Option<ChunkId>
}

#[wasm_bindgen]
impl Buffer {
    pub fn new(size : usize) -> Buffer {
        let mut v = Vec::with_capacity(size);
        for _ in 0..size { v.push(0); }
        Buffer(v)
    }

    pub fn as_ptr(&self) -> *const u16 {
        self.0.as_ptr()
    }
}

#[wasm_bindgen]
impl EscapeTime {
    pub fn new(c_re : f32, c_im : f32, max_iter : u16, escape_radius : f32) -> EscapeTime {
        EscapeTime(EscapeTimeInner::new(Complex::new(c_re, c_im), max_iter, escape_radius))
    }
}

#[wasm_bindgen]
impl Canvas {
    pub fn new(chunk_width_px : usize, chunk_height_px : usize, chunk_delta_re : f32, chunk_delta_im : f32, origin_re : f32, origin_im : f32) -> Canvas {
        Canvas(CanvasInner::new(chunk_width_px, chunk_height_px, Complex::new(chunk_delta_re, chunk_delta_im), Complex::new(origin_re, origin_im)))
    }
}

#[wasm_bindgen]
impl CanvasRect {
    pub fn new(top_left_re : i32, top_left_im : i32, width_chunks : u32, height_chunks : u32) -> CanvasRect {
        CanvasRect(CanvasRectInner::new(Complex::new(top_left_re, top_left_im), width_chunks, height_chunks))
    }
}

#[wasm_bindgen]
impl EscapeTimeRunner {
    pub fn new(escape_time : EscapeTime, canvas : Canvas) -> EscapeTimeRunner {
        EscapeTimeRunner {
            inner: EscapeTimeRunnerInner::new(escape_time.0, canvas.0),
            current: None
        }
    }

    /// Add a job to the runner. This job will take priority over previously added jobs.
    pub fn push_job(&mut self, job : CanvasRect) {
        self.inner.push_job(job.0);
    }

    /// If the runner has a next chunk, advance to it and return true.
    /// Otherwise return false.
    pub fn advance(&mut self) -> bool {
        self.current = self.inner.next();
        self.current.is_some()
    }

    /// Real component of the current chunk's ChunkId.
    /// ChunkIds represent the position of the chunk's top left corner relative
    /// to the canvas origin, measured in chunks.
    /// ChunkIds increase from left to right and from top to bottom.
    ///
    /// # Panics
    /// 
    /// If there's no current chunk.
    /// Use the return value of `advance` to determine if there's a current chunk before calling this method.
    pub fn current_re(&self) -> i32 {
        self.current.unwrap().re
    }

    /// Imaginary component of the current chunk's ChunkId.
    /// ChunkIds represent the position of the chunk's top left corner relative
    /// to the canvas origin, measured in chunks.
    /// ChunkIds increase from left to right and from top to bottom.
    ///
    /// # Panics
    /// 
    /// If there's no current chunk.
    /// Use the return value of `advance` to determine if there's a current chunk before calling this method.
    pub fn current_im(&self) -> i32 {
        self.current.unwrap().im
    }

    /// Load escape time data for the current chunk into the provided output buffer.
    ///
    /// # Panics
    ///
    /// If there's no current chunk to load or if the provided output buffer is insufficient.
    /// Use the return value of `advance` to determine if there's a current chunk before calling this method.
    pub fn load(&self, output : &mut Buffer) {
        self.inner.load(&mut output.0).unwrap();
    }
}
