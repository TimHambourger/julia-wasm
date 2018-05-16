/* tslint:disable */
export class Buffer {
free(): void;
static  new(arg0: number): Buffer;

 as_ptr(): number;

}
export class Canvas {
free(): void;
static  new(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number): Canvas;

}
export class EscapeTimeRunner {
free(): void;
static  new(arg0: EscapeTime, arg1: Canvas): EscapeTimeRunner;

 update(arg0: EscapeTime, arg1: Canvas): void;

 has_next(): boolean;

 load_next(arg0: Buffer): void;

 last_chunk_loaded_re(): number;

 last_chunk_loaded_im(): number;

}
export class EscapeTime {
free(): void;
static  new(arg0: number, arg1: number, arg2: number, arg3: number): EscapeTime;

}
