extern crate num;
extern crate num_complex;

pub mod escape_time;
pub use escape_time::{EscapeTime, EscapeTimeRunner};
pub mod canvas;
pub use canvas::{Canvas, CanvasChunk, Iter};
