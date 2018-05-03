/* tslint:disable */
export class Complex {
            public ptr: number;
        constructor(ptr: number);
free(): void;
static new(arg0: number, arg1: number): Complex;
}

export class Buffer {
            public ptr: number;
        constructor(ptr: number);
free(): void;
static new(arg0: number): Buffer;
 as_ptr(): number;
}

export class EscapeTimeAPI {
            public ptr: number;
        constructor(ptr: number);
free(): void;
static new(arg0: Complex, arg1: number, arg2: number): EscapeTimeAPI;
 load(arg0: Buffer, arg1: number, arg2: Complex, arg3: Complex): void;
}

