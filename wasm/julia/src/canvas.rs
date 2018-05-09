use num_complex::{Complex,Complex32};
use num::signum;

#[derive(PartialEq, Copy, Clone)]
pub struct Canvas {
    pub chunk_width_px : usize,
    pub chunk_height_px : usize,
    pub canvas_width_chunks : u32,
    pub canvas_height_chunks : u32,
    pub top_left : Complex32,
    pub bottom_right : Complex32
}

#[derive(Copy, Clone)]
pub struct CanvasChunk {
    pub top_left : Complex32
}

#[derive(Copy, Clone)]
pub struct Iter {
    canvas : Canvas,
    // Some(z) means z is top_left of the current chunk
    // None means iteration is finished
    z : Option<Complex32>
}

impl Canvas {
    pub fn new(chunk_width_px : usize, chunk_height_px : usize, canvas_width_chunks : u32, canvas_height_chunks : u32, top_left : Complex32, bottom_right : Complex32) -> Canvas {
        Canvas { chunk_width_px, chunk_height_px, canvas_width_chunks, canvas_height_chunks, top_left, bottom_right }
    }

    pub fn iter(&self) -> Iter {
        Iter::new(*self)
    }

    /**
     * bottom_right - top_left in complex coords for a single chunk
     */
    pub fn chunk_delta(&self) -> Complex32 {
        Complex::new(
            (self.bottom_right.re - self.top_left.re) / (self.canvas_width_chunks as f32),
            (self.bottom_right.im - self.top_left.im) / (self.canvas_height_chunks as f32)
        )
    }

    /**
     * bottom_right - top_left in complex coords for a single pixel
     */
    pub fn pixel_delta(&self) -> Complex32 {
        let chunk_delta = self.chunk_delta();
        Complex::new(
            chunk_delta.re / (self.chunk_width_px as f32),
            chunk_delta.im / (self.chunk_height_px as f32)
        )
    }

    /**
     * 1 if real axis increases from left to right, -1 if it decreases, and 0 if there's no change (which would be unusual)
     */
    pub fn sign_re(&self) -> f32 {
        signum(self.bottom_right.re - self.top_left.re)
    }


    /**
     * 1 if im axis increases from top to bottom, -1 if it decreases, and 0 if there's no change (which would be unusual)
     */
    pub fn sign_im(&self) -> f32 {
        signum(self.bottom_right.im - self.top_left.im)
    }
}

impl Iter {
    pub fn new(canvas : Canvas) -> Iter {
        let top_left = canvas.top_left;
        Iter { canvas, z : Some(top_left) }
    }
}

impl Iterator for Iter {
    type Item = CanvasChunk;

    fn next(&mut self) -> Option<CanvasChunk> {
        // TODO: Many possible optimizations...
        // Say starting at center of canvas, enabling panning, caching of unneeded chunks, etc, etc

        if let Some(z) = self.z {
            // This is the chunk we'll return.
            let chunk = CanvasChunk { top_left : z };

            // Now calculate the next z...
            let chunk_delta = self.canvas.chunk_delta();
            let sign_re = self.canvas.sign_re();
            let sign_im = self.canvas.sign_im();

            let mut next_re = z.re + chunk_delta.re;
            let mut next_im = z.im;

            if sign_re * next_re > sign_re * self.canvas.bottom_right.re {
                next_re = self.canvas.top_left.re;
                next_im = z.im + chunk_delta.im;
            }

            self.z = if sign_im * next_im > sign_im * self.canvas.bottom_right.im {
                // exhausted canvas
                None
            } else {
                Some(Complex::new(next_re, next_im))
            };

            return Some(chunk);
        }
        None
    }
}
