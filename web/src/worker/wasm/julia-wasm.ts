
            /* tslint:disable */
            let wasm_exports: WasmExports;

            export class Complex {
        
                constructor(public ptr: number) {}
            
            free(): void {
                const ptr = this.ptr;
                this.ptr = 0;
                wasm_exports.h(ptr);
            }
        static new(arg0: number, arg1: number): Complex {
        const ret = wasm_exports.a(arg0, arg1);
                return new Complex(ret);
                    
            }
}


            export class Buffer {
        
                constructor(public ptr: number) {}
            
            free(): void {
                const ptr = this.ptr;
                this.ptr = 0;
                wasm_exports.i(ptr);
            }
        static new(arg0: number): Buffer {
        const ret = wasm_exports.b(arg0);
                return new Buffer(ret);
                    
            }
 as_ptr(): number {
        const ret = wasm_exports.c(this.ptr);
                return ret;
            }
 byte_len(): number {
        const ret = wasm_exports.d(this.ptr);
                return ret;
            }
}


            export class EscapeTimeAPI {
        
                constructor(public ptr: number) {}
            
            free(): void {
                const ptr = this.ptr;
                this.ptr = 0;
                wasm_exports.j(ptr);
            }
        static new(arg0: Complex, arg1: number, arg2: number): EscapeTimeAPI {
        const ptr0 = arg0.ptr;
                        arg0.ptr = 0;
                    const ret = wasm_exports.e(ptr0, arg1, arg2);
                return new EscapeTimeAPI(ret);
                    
            }
 load(arg0: Buffer, arg1: number, arg2: Complex, arg3: Complex): void {
        const ptr2 = arg2.ptr;
                        arg2.ptr = 0;
                    const ptr3 = arg3.ptr;
                        arg3.ptr = 0;
                    const ret = wasm_exports.f(this.ptr, arg0.ptr, arg1, ptr2, ptr3);
                return ret;
            }
}

let memory: WebAssembly.Memory;

                function getStringFromWasm(ptr: number, len: number): string {
                    const mem = new Uint8Array(memory.buffer);
                    const slice = mem.slice(ptr, ptr + len);
                    const ret = new TextDecoder('utf-8').decode(slice);
                    return ret;
                }
            

            interface WasmImportsTop {
                env: WasmImports,
            }

            interface WasmImports {
                g(arg0: number, arg1: number): void;
            }

            interface WasmExports {
                e(arg0: number, arg1: number, arg2: number): number;
b(arg0: number): number;
h(arg0: number): void;
a(arg0: number, arg1: number): number;
c(arg0: number): number;
d(arg0: number): number;
i(arg0: number): void;
f(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number): void;
j(arg0: number): void;
memory: WebAssembly.Memory;
            }

            export interface Imports {
                
            }

            

            export interface Exports {
                module: WebAssembly.Module;
                instance: WebAssembly.Module;
                Complex: typeof Complex;
Buffer: typeof Buffer;
EscapeTimeAPI: typeof EscapeTimeAPI;
extra: ExtraExports;

            }

            export interface ExtraExports {
memory: WebAssembly.Memory;
}


            function xform(obj: WebAssembly.ResultObject): Exports {
                let { module, instance } = obj;
                let exports: WasmExports = instance.exports;
                memory = exports.memory;
wasm_exports = exports;

                return {
                module,
                instance,
        Complex: Complex,
Buffer: Buffer,
EscapeTimeAPI: EscapeTimeAPI,
extra: {
memory:exports.memory,
},
};
            }
            export function instantiate(bytes: any, _imports: Imports): Promise<Exports> {
                let wasm_imports: WasmImportsTop = {
                    env: {
                        
                    g: 
                    function(ptr: number, len: number) {
                        throw new Error(getStringFromWasm(ptr, len));
                    }
                ,
                
                    },
                };
                return WebAssembly.instantiate(bytes, wasm_imports).then(xform);
            }
        