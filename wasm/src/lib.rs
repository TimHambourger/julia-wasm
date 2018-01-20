#![feature(proc_macro)]

extern crate julia;
extern crate num_complex;
extern crate wasm_bindgen;

use julia::EscapeTime;
use num_complex::{Complex32, Complex as RustComplex};
use std::mem::size_of;
use wasm_bindgen::prelude::*;


wasm_bindgen! {
    pub struct Complex(Complex32);

    // wasm-bindgen doesn't currently support Vec's or slices.
    // So add a wrapper type for negotiating these.
    pub struct Buffer(Vec<u16>);

    pub struct EscapeTimeAPI(EscapeTime);

    impl Complex {
        pub fn new(re : f32, im : f32) -> Complex {
            Complex(RustComplex::new(re, im))
        }
    }

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

    impl EscapeTimeAPI {
        pub fn new(c : Complex, max_iter : u16, escape_radius : f32) -> EscapeTimeAPI {
            EscapeTimeAPI(EscapeTime::new(c.0, max_iter, escape_radius))
        }

        pub fn load(&self, output : &mut Buffer, width : usize, init : Complex, step : Complex) {
            self.0.load(&mut output.0, width, init.0, step.0);
        }
    }
}
