use num_complex::{Complex,Complex32};

/// An unbounded canvas divided into chunks.
/// Chunks carry a size in px and in complex coords, and canvas
/// is marked with an origin that specifies how chunks are aligned
#[derive(PartialEq, Copy, Clone)]
pub struct Canvas {
    pub chunk_width_px : usize,
    pub chunk_height_px : usize,

    /// bottom right - top left for any given chunk
    pub chunk_delta : Complex32,

    /// top left complex coordinate of chunk 0 + 0i
    pub origin : Complex32
}

/// By convention we identify chunks by the distance their top left
/// corner is from the canvas's origin, measured in chunks.
pub type ChunkId = Complex<i32>;

/// A rectangular region of canvas, specified in chunk sizes
#[derive(Eq, PartialEq, Copy, Clone)]
pub struct CanvasRect {
    pub top_left : ChunkId,
    pub width_chunks : u32,
    pub height_chunks : u32
}

// #[derive(Copy, Clone)]
pub struct RectIter {
    rect : CanvasRect,
    idx : u32
}

impl Canvas {
    pub fn new(chunk_width_px : usize, chunk_height_px : usize, chunk_delta : Complex32, origin : Complex32) -> Canvas {
        Canvas { chunk_width_px, chunk_height_px, chunk_delta, origin }
    }

    /// Convert a ChunkId into the complex coord of its top left corner.
    pub fn complex_coords(&self, chunk : ChunkId) -> Complex32 {
        Complex::new(
            self.chunk_delta.re * (chunk.re as f32) + self.origin.re,
            self.chunk_delta.im * (chunk.im as f32) + self.origin.im
        )
    }

     /// bottom right - top left in complex coords for a single pixel
    pub fn pixel_delta(&self) -> Complex32 {
        Complex::new(
            self.chunk_delta.re / (self.chunk_width_px as f32),
            self.chunk_delta.im / (self.chunk_height_px as f32)
        )
    }
}

impl CanvasRect {
    pub fn new(top_left : ChunkId, width_chunks : u32, height_chunks : u32) -> CanvasRect {
        CanvasRect { top_left, width_chunks, height_chunks }
    }

    pub fn iter(&self) -> RectIter {
        RectIter::new(*self)
    }
}

impl RectIter {
    pub fn new(rect : CanvasRect) -> RectIter {
        RectIter { rect, idx : 0 }
    }
}

impl Iterator for RectIter {
    type Item = ChunkId;

    fn next(&mut self) -> Option<ChunkId> {
        if self.idx < self.rect.width_chunks * self.rect.height_chunks {
            let chunk = Complex::new(
                self.rect.top_left.re + ((self.idx % self.rect.width_chunks) as i32),
                self.rect.top_left.im + ((self.idx / self.rect.width_chunks) as i32)
            );
            self.idx += 1;
            Some(chunk)
        } else {
            None
        }
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        let remaining = (self.rect.width_chunks * self.rect.height_chunks - self.idx) as usize;
        (remaining, Some(remaining))
    }
}
