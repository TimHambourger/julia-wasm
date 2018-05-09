/* tslint:disable */

                            export const memory: WebAssembly.Memory;
                        
                    export function __wbg_buffer_free(a: number): void;
                
                    export function __wbg_escapetime_free(a: number): void;
                
                    export function __wbg_canvas_free(a: number): void;
                
                    export function __wbg_escapetimerunner_free(a: number): void;
                
                    export function buffer_new(a: number): number;
                
                    export function buffer_as_ptr(a: number): number;
                
                    export function escapetime_new(a: number, b: number, c: number, d: number): number;
                
                    export function canvas_new(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number): number;
                
                    export function escapetimerunner_new(a: number, b: number): number;
                
                    export function escapetimerunner_update(a: number, b: number, c: number): void;
                
                    export function escapetimerunner_has_next(a: number): number;
                
                    export function escapetimerunner_load_next(a: number, b: number): void;
                
                    export function escapetimerunner_last_chunk_loaded_re(a: number): number;
                
                    export function escapetimerunner_last_chunk_loaded_im(a: number): number;
                
                    export function __wbindgen_malloc(a: number): number;
                export const booted: Promise<boolean>;