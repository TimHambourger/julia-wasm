
            /* tslint:disable */
            import * as wasm from './julia_wasm_wasm'; // imports from wasm file
            

            export class Complex {
                constructor(ptr) {
                    this.ptr = ptr;
                }
            
            free() {
                const ptr = this.ptr;
                this.ptr = 0;
                wasm.__wbindgen_complex_free(ptr);
            }
        static new(arg0, arg1) {
        const ret = wasm.complex_new(arg0, arg1);
                return new Complex(ret);
                    
            }
}

export class Buffer {
                constructor(ptr) {
                    this.ptr = ptr;
                }
            
            free() {
                const ptr = this.ptr;
                this.ptr = 0;
                wasm.__wbindgen_buffer_free(ptr);
            }
        static new(arg0) {
        const ret = wasm.buffer_new(arg0);
                return new Buffer(ret);
                    
            }
 as_ptr() {
        const ret = wasm.buffer_as_ptr(this.ptr);
                return ret;
            }
}

export class EscapeTimeAPI {
                constructor(ptr) {
                    this.ptr = ptr;
                }
            
            free() {
                const ptr = this.ptr;
                this.ptr = 0;
                wasm.__wbindgen_escapetimeapi_free(ptr);
            }
        static new(arg0, arg1, arg2) {
        const ptr0 = arg0.ptr;
                        arg0.ptr = 0;
                    const ret = wasm.escapetimeapi_new(ptr0, arg1, arg2);
                return new EscapeTimeAPI(ret);
                    
            }
 load(arg0, arg1, arg2, arg3) {
        const ptr2 = arg2.ptr;
                        arg2.ptr = 0;
                    const ptr3 = arg3.ptr;
                        arg3.ptr = 0;
                    const ret = wasm.escapetimeapi_load(this.ptr, arg0.ptr, arg1, ptr2, ptr3);
                return ret;
            }
}


                function getStringFromWasm(ptr, len) {
                    const mem = new Uint8Array(wasm.memory.buffer);
                    const slice = mem.slice(ptr, ptr + len);
                    const ret = new TextDecoder('utf-8').decode(slice);
                    return ret;
                }
            export const __wbindgen_throw = 
                    function(ptr, len) {
                        throw new Error(getStringFromWasm(ptr, len));
                    }
                ;
        