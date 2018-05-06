#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate julia;
extern crate num_complex;
extern crate wasm_bindgen;

use julia::EscapeTime;
use num_complex::Complex;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Buffer(Vec<u16>);

#[wasm_bindgen]
pub struct EscapeTimeAPI(EscapeTime);

#[wasm_bindgen]
impl Buffer {
    pub fn new(size : usize) -> Buffer {
        let mut v = Vec::with_capacity(size);
        for _ in 0..size {
            v.push(0);
        }
        Buffer(v)
    }

    pub fn as_ptr(&self) -> *const u16 {
        self.0.as_ptr()
    }
}

#[wasm_bindgen]
impl EscapeTimeAPI {
    pub fn new(c_re : f32, c_im : f32, max_iter : u16, escape_radius : f32) -> EscapeTimeAPI {
        EscapeTimeAPI(EscapeTime::new(Complex::new(c_re, c_im), max_iter, escape_radius))
    }

    pub fn load(&self, output : &mut Buffer, width : usize, init_re : f32, init_im : f32, step_re : f32, step_im : f32) {
        self.0.load(&mut output.0, width, Complex::new(init_re, init_im), Complex::new(step_re, step_im));
    }
}
