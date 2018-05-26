/* tslint:disable */

                            export const memory: WebAssembly.Memory;
                        
                    export function __wbg_buffer_free(a: number): void;
                
                    export function __wbg_escapetime_free(a: number): void;
                
                    export function __wbg_canvas_free(a: number): void;
                
                    export function __wbg_canvasrect_free(a: number): void;
                
                    export function __wbg_escapetimerunner_free(a: number): void;
                
                    export function buffer_new(a: number): number;
                
                    export function buffer_as_ptr(a: number): number;
                
                    export function escapetime_new(a: number, b: number, c: number, d: number): number;
                
                    export function canvas_new(a: number, b: number, c: number, d: number, e: number, f: number): number;
                
                    export function canvasrect_new(a: number, b: number, c: number, d: number): number;
                
                    export function escapetimerunner_new(a: number, b: number): number;
                
                    export function escapetimerunner_push_job(a: number, b: number): void;
                
                    export function escapetimerunner_advance(a: number): number;
                
                    export function escapetimerunner_current_re(a: number): number;
                
                    export function escapetimerunner_current_im(a: number): number;
                
                    export function escapetimerunner_load(a: number, b: number): void;
                
                    export function __wbindgen_malloc(a: number): number;
                export const booted: Promise<boolean>;