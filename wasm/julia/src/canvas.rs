use num_complex::Complex32;

pub struct Canvas {
    chunk_width_px : u32,
    chunk_height_px : u32,
    canvas_width_chunks : u32,
    canvas_height_chunks : u32,
    top_left : Complex32,
    bottom_right : Complex32
}

pub struct CanvasChunk {
    width_px : u32,
    height_px : u32,
    top_left : Complex32,
    bottom_right : Complex32
}

pub struct Iter {
    chunk_width_px : u32,
    chunk_height_px : u32,
    // bottom_right - top_left for any given chunk
    chunk_delta : Complex32,
    z : Complex32
}

impl Iterator for Iter {
    
}
