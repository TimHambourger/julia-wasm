use num_complex::{Complex, Complex32};
use ::canvas::*;

#[derive(PartialEq, Copy, Clone)]
pub struct EscapeTime {
    c : Complex32,
    max_iter : u16,
    radius_sqr : f32
}

#[derive(Copy, Clone)]
pub struct EscapeTimeRunner {
    escape_time : EscapeTime,
    canvas : Canvas,
    iter : Iter,
    next_chunk : Option<CanvasChunk>
}

#[derive(Debug)]
pub enum RunnerLoadNextError {
    NoNextChunk,
    InsufficientBuffer
}

impl EscapeTime {
    pub fn new(c : Complex32, max_iter : u16, escape_radius : f32) -> EscapeTime {
        EscapeTime { c, max_iter, radius_sqr : escape_radius * escape_radius }
    }

    pub fn load(&self, output : &mut [u16], width_px : usize, init : Complex32, step : Complex32) {
        for (i, result) in output.iter_mut().enumerate() {
            *result = self.escape_time(init + Complex::new(((i % width_px) as f32) * step.re, ((i / width_px) as f32) * step.im));
        }
    }

    pub fn escape_time(&self, mut seed : Complex32) -> u16 {
        let mut time = 0u16;

        while time < self.max_iter && seed.norm_sqr() < self.radius_sqr {
            seed = self.next_iter(seed);
            time += 1;
        }

        time
    }

    pub fn next_iter(&self, seed : Complex32) -> Complex32 {
        seed * seed + self.c
    }
}

impl EscapeTimeRunner {
    pub fn new(escape_time : EscapeTime, canvas : Canvas) -> EscapeTimeRunner {
        let mut iter = canvas.iter();
        let next_chunk = iter.next();
        EscapeTimeRunner { escape_time, canvas, iter, next_chunk }
    }

    pub fn update(&mut self, escape_time : EscapeTime, canvas : Canvas) {
        // For now, passing in a different escape_time or canvas resets
        // everything. In the future, plan to enable panning in a way that
        // remembers which chunks have already been loaded and skips them.
        if escape_time != self.escape_time || canvas != self.canvas {
            let mut iter = canvas.iter();
            let next_chunk = iter.next();
            self.escape_time = escape_time;
            self.canvas = canvas;
            self.iter = iter;
            self.next_chunk = next_chunk;
        }
    }

    pub fn has_next(&self) -> bool {
        self.next_chunk.is_some()
    }

    /// Load the escape time data for the next canvas chunk into the provided output buffer.
    /// If successful, returns the successfully loaded chunk.
    pub fn load_next(&mut self, output : &mut [u16]) -> Result<CanvasChunk, RunnerLoadNextError> {
        if let Some(next_chunk) = self.next_chunk {
            if output.len() < self.canvas.chunk_width_px * self.canvas.chunk_height_px {
                Err(RunnerLoadNextError::InsufficientBuffer)
            } else {
                let step = self.canvas.pixel_delta();
                // Add half a step so we're calculating from the center of each logical pixel,
                // rather than from the upper left corner.
                let init = next_chunk.top_left + step / 2.0;
                self.escape_time.load(output, self.canvas.chunk_width_px, init, step);
                self.next_chunk = self.iter.next();
                Ok(next_chunk)
            }
        } else {
            Err(RunnerLoadNextError::NoNextChunk)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn escape_time_escape_time() {
        // See is 0 -> Julia set is the unit disc
        let escape_time = EscapeTime::new(Complex::new(0.0, 0.0), 100, 2.0);
        // 0 is in the unit disc
        assert_eq!(escape_time.escape_time(Complex::new(0.0, 0.0)), 100);
        // 0.5 + 0.5i is in the unit disc
        assert_eq!(escape_time.escape_time(Complex::new(0.5, 0.5)), 100);
        // 2 is outside of the unit disc -> escape time should be less than max_iter
        assert!(escape_time.escape_time(Complex::new(2.0, 0.0)) < 100);
    }

    #[test]
    fn escape_time_load() {
        let escape_time = EscapeTime::new(Complex::new(0.0, 1.0), 100, 2.0);
        let mut buffer = Vec::with_capacity(100);
        for _ in 0..100 { buffer.push(0); }
        escape_time.load(&mut buffer, 10, Complex::new(-1.0, 1.0), Complex::new(0.2, 0.2));
    }
}
