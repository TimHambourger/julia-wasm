#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate julia;
extern crate num_complex;
extern crate wasm_bindgen;

use julia::{EscapeTimeRunner as EscapeTimeRunnerInner, EscapeTime as EscapeTimeInner, Canvas as CanvasInner, CanvasChunk};
use num_complex::Complex;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Buffer(Vec<u16>);

#[wasm_bindgen]
pub struct EscapeTime(EscapeTimeInner);

#[wasm_bindgen]
pub struct Canvas(CanvasInner);

#[wasm_bindgen]
pub struct EscapeTimeRunner {
    inner : EscapeTimeRunnerInner,
    last_chunk_loaded : Option<CanvasChunk>
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
    pub fn new(chunk_width_px : usize, chunk_height_px : usize, canvas_width_chunks : u32, canvas_height_chunks : u32, top_left_re : f32, top_left_im : f32, bottom_right_re : f32, bottom_right_im : f32) -> Canvas {
        Canvas(CanvasInner::new(chunk_width_px, chunk_height_px, canvas_width_chunks, canvas_height_chunks, Complex::new(top_left_re, top_left_im), Complex::new(bottom_right_re, bottom_right_im)))
    }
}

#[wasm_bindgen]
impl EscapeTimeRunner {
    pub fn new(escape_time : EscapeTime, canvas : Canvas) -> EscapeTimeRunner {
        EscapeTimeRunner {
            inner: EscapeTimeRunnerInner::new(escape_time.0, canvas.0),
            last_chunk_loaded: None
        }
    }

    pub fn update(&mut self, escape_time : EscapeTime, canvas : Canvas) {
        self.inner.update(escape_time.0, canvas.0);
        self.last_chunk_loaded = None;
    }

    /// Is there a next chunk to load?
    pub fn has_next(&self) -> bool {
        self.inner.has_next()
    }

    /// Load escape time data for the next chunk into the provided output buffer.
    ///
    /// # Panics
    ///
    /// If there's no next chunk to load or if the provided output buffer is insufficient.
    /// You can use `has_next` to determine if there's a next chunk before calling this method.
    pub fn load_next(&mut self, output : &mut Buffer) {
        // TODO: Better error handling strategy than a wasm panic!
        self.last_chunk_loaded = Some(self.inner.load_next(&mut output.0).unwrap());
    }

    /// Return the real top left coord of the last chunk loaded.
    ///
    /// # Panics
    ///
    /// If there's no last chunk loaded. Call this immediately after calling `load_next`
    /// to avoid a panic.
    pub fn last_chunk_loaded_re(&self) -> f32 {
        // TODO: Better error handling?
        self.last_chunk_loaded.unwrap().top_left.re
    }

    /// Return the imaginary top left coord of the last chunk loaded.
    ///
    /// # Panics
    ///
    /// If there's no last chunk loaded. Call this immediately after calling `load_next`
    /// to avoid a panic.
    pub fn last_chunk_loaded_im(&self) -> f32 {
        // TODO: Better error handling?
        self.last_chunk_loaded.unwrap().top_left.im
    }
}
