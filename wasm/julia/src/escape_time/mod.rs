use num_complex::{Complex, Complex32};
use ::canvas::*;

#[derive(PartialEq, Copy, Clone)]
pub struct EscapeTime {
    c : Complex32,
    max_iter : u16,
    radius_sqr : f32
}

pub struct EscapeTimeRunner {
    escape_time : EscapeTime,
    canvas : Canvas,
    // By job we just mean an iterator over canvas rects.
    // We process jobs in LIFO order.
    jobs : Vec<RectIter>,
    current : Option<ChunkId>
}

#[derive(Debug, Eq, PartialEq)]
pub enum RunnerLoadError {
    NoCurrentChunk,
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
        EscapeTimeRunner { escape_time, canvas, jobs : vec![], current : None }
    }

    pub fn push_job(&mut self, job : CanvasRect) {
        // No reason to push an empty job
        if job.width_chunks * job.height_chunks > 0 {
            self.jobs.push(job.iter());
        }
    }

    /// Advance to the next canvas chunk, if any, and return its ChunkId.
    /// If no next chunk, return None.
    pub fn next(&mut self) -> Option<ChunkId> {
        while self.jobs.len() > 0 {
            if let Some(chunk) = self.jobs.last_mut().unwrap().next() {
                self.current = Some(chunk);
                return self.current;
            }
            self.jobs.pop();
        }
        self.current = None;
        self.current
    }

    /// Load the escape time data for the current canvas chunk into the provided output buffer.
    pub fn load(&self, output : &mut [u16]) -> Result<(), RunnerLoadError> {
        if let Some(chunk) = self.current {
            if output.len() < self.canvas.chunk_width_px * self.canvas.chunk_height_px {
                Err(RunnerLoadError::InsufficientBuffer)
            } else {
                let step = self.canvas.pixel_delta();
                // Add half a step so we're calculating from the center of each logical pixel,
                // rather than from the upper left corner.
                let init = self.canvas.complex_coords(chunk) + step / 2.0;
                self.escape_time.load(output, self.canvas.chunk_width_px, init, step);
                Ok(())
            }
        } else {
            Err(RunnerLoadError::NoCurrentChunk)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn escape_time_escape_time() {
        // See is 0 -> Julia set is the unit disc
        let escape_time = EscapeTime::new(Complex::new(0.0, 0.0), 50, 2.0);
        // 0 is in the unit disc
        assert_eq!(escape_time.escape_time(Complex::new(0.0, 0.0)), 50);
        // 0.5 + 0.5i is in the unit disc
        assert_eq!(escape_time.escape_time(Complex::new(0.5, 0.5)), 50);
        // 2 is outside of the unit disc -> escape time should be less than max_iter
        assert!(escape_time.escape_time(Complex::new(2.0, 0.0)) < 50);
    }

    #[test]
    fn escape_time_load() {
        let escape_time = EscapeTime::new(Complex::new(0.0, 1.0), 50, 2.0);
        let mut buffer = Vec::with_capacity(100);
        for _ in 0..100 { buffer.push(0); }
        escape_time.load(&mut buffer, 10, Complex::new(-1.0, 1.0), Complex::new(0.2, 0.2));
    }

    #[test]
    fn runner_single_job() {
        let escape_time = EscapeTime::new(Complex::new(0.0, 0.0), 50, 2.0);
        let canvas = Canvas::new(32, 32, Complex::new(0.5, -0.5), Complex::new(0.0, 0.0));
        let mut runner = EscapeTimeRunner::new(escape_time, canvas);
        runner.push_job(CanvasRect::new(Complex::new(-1, -1), 2, 2));
        let mut output = Vec::with_capacity(32 * 32);
        for _ in 0..32*32 {
            output.push(0);
        }
        let mut chunk_coords = vec![];
        // Run job to completion
        while let Some(chunk) = runner.next() {
            runner.load(&mut output).unwrap();
            chunk_coords.push((chunk, canvas.complex_coords(chunk)));
        }
        assert_eq!(chunk_coords, vec![
            (Complex::new(-1, -1), Complex::new(-0.5, 0.5)),
            (Complex::new(0, -1),  Complex::new(0.0, 0.5)),
            (Complex::new(-1, 0),  Complex::new(-0.5, 0.0)),
            (Complex::new(0, 0),   Complex::new(0.0, 0.0))
        ]);
    }

    #[test]
    fn runner_multi_jobs() {
        let escape_time = EscapeTime::new(Complex::new(0.0, 0.0), 50, 2.0);
        let canvas = Canvas::new(32, 32, Complex::new(0.5, -0.5), Complex::new(0.0, 0.0));
        let mut runner = EscapeTimeRunner::new(escape_time, canvas);
        runner.push_job(CanvasRect::new(Complex::new(-1, -1), 2, 2));
        let mut output = Vec::with_capacity(32 * 32);
        for _ in 0..32*32 {
            output.push(0);
        }
        let mut chunk_coords = vec![];

        // Partially complete first job...
        let mut chunk = runner.next().unwrap();
        runner.load(&mut output).unwrap();
        chunk_coords.push((chunk, canvas.complex_coords(chunk)));
        chunk = runner.next().unwrap();
        runner.load(&mut output).unwrap();
        chunk_coords.push((chunk, canvas.complex_coords(chunk)));

        // ... then push a new job, which should get completed before the previous one...
        runner.push_job(CanvasRect::new(Complex::new(-10, -10), 2, 2));

        // ... load a few more chunks...
        chunk = runner.next().unwrap();
        runner.load(&mut output).unwrap();
        chunk_coords.push((chunk, canvas.complex_coords(chunk)));
        chunk = runner.next().unwrap();
        runner.load(&mut output).unwrap();
        chunk_coords.push((chunk, canvas.complex_coords(chunk)));

        // ... then push an empty job, which should be a no-op...
        runner.push_job(CanvasRect::new(Complex::new(100, 100), 0, 0));

        // ... and finally run to completion and assert
        while let Some(chunk) = runner.next() {
            runner.load(&mut output).unwrap();
            chunk_coords.push((chunk, canvas.complex_coords(chunk)));
        }

        assert_eq!(chunk_coords, vec![
            (Complex::new(-1, -1),   Complex::new(-0.5, 0.5)),
            (Complex::new(0, -1),    Complex::new(0.0, 0.5)),
            // Switch to new job
            (Complex::new(-10, -10), Complex::new(-5.0, 5.0)),
            (Complex::new(-9, -10),  Complex::new(-4.5, 5.0)),
            (Complex::new(-10, -9),  Complex::new(-5.0, 4.5)),
            (Complex::new(-9, -9),   Complex::new(-4.5, 4.5)),
            // And then finish original job
            (Complex::new(-1, 0),  Complex::new(-0.5, 0.0)),
            (Complex::new(0, 0),   Complex::new(0.0, 0.0))
        ]);
    }

    #[test]
    fn runner_error_codes() {
        let escape_time = EscapeTime::new(Complex::new(0.0, 0.0), 50, 2.0);
        let canvas = Canvas::new(32, 32, Complex::new(0.5, -0.5), Complex::new(0.0, 0.0));
        let mut runner = EscapeTimeRunner::new(escape_time, canvas);
        // Too small for 32 x 32 canvas chunk
        let mut output = Vec::with_capacity(16 * 16);
        for _ in 0..16*16 {
            output.push(0);
        }
        // Didn't push job or advance runner before trying to load data
        assert_eq!(runner.load(&mut output), Err(RunnerLoadError::NoCurrentChunk));
        // Add non-empty job and advance runner
        runner.push_job(CanvasRect::new(Complex::new(0, 0), 1, 1));
        runner.next();
        // Now we hit the insufficient buffer
        assert_eq!(runner.load(&mut output), Err(RunnerLoadError::InsufficientBuffer));
    }
}
