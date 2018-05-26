/* tslint:disable */
export class CanvasRect {
free(): void;
static  new(arg0: number, arg1: number, arg2: number, arg3: number): CanvasRect;

}
export class EscapeTimeRunner {
free(): void;
static  new(arg0: EscapeTime, arg1: Canvas): EscapeTimeRunner;

 push_job(arg0: CanvasRect): void;

 advance(): boolean;

 current_re(): number;

 current_im(): number;

 load(arg0: Buffer): void;

}
export class EscapeTime {
free(): void;
static  new(arg0: number, arg1: number, arg2: number, arg3: number): EscapeTime;

}
export class Buffer {
free(): void;
static  new(arg0: number): Buffer;

 as_ptr(): number;

}
export class Canvas {
free(): void;
static  new(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number): Canvas;

}
