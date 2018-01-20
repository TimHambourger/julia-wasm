use num_complex::{Complex, Complex32};

pub struct EscapeTime {
    c : Complex32,
    max_iter : u16,
    radius_sqr : f32
}

impl EscapeTime {
    pub fn new(c : Complex32, max_iter : u16, escape_radius : f32) -> EscapeTime {
        EscapeTime { c, max_iter, radius_sqr : escape_radius * escape_radius }
    }

    pub fn load(&self, output : &mut [u16], width : usize, init : Complex32, step : Complex32) {
        for (i, result) in output.iter_mut().enumerate() {
            *result = self.escape_time(init + Complex::new(((i % width) as f32) * step.re, ((i / width) as f32) * step.im));
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