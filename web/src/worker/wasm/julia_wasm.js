/* tslint:disable */
import * as wasm from './julia_wasm_bg';

export class EscapeTime {

                static __construct(ptr) {
                    return new EscapeTime(ptr);
                }

                constructor(ptr) {
                    this.ptr = ptr;
                }

            free() {
                const ptr = this.ptr;
                this.ptr = 0;
                wasm.__wbg_escapetime_free(ptr);
            }
        static new(arg0, arg1, arg2, arg3) {
    return EscapeTime.__construct(wasm.escapetime_new(arg0, arg1, arg2, arg3));
}
}

export class Canvas {

                static __construct(ptr) {
                    return new Canvas(ptr);
                }

                constructor(ptr) {
                    this.ptr = ptr;
                }

            free() {
                const ptr = this.ptr;
                this.ptr = 0;
                wasm.__wbg_canvas_free(ptr);
            }
        static new(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    return Canvas.__construct(wasm.canvas_new(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7));
}
}

export class Buffer {

                static __construct(ptr) {
                    return new Buffer(ptr);
                }

                constructor(ptr) {
                    this.ptr = ptr;
                }

            free() {
                const ptr = this.ptr;
                this.ptr = 0;
                wasm.__wbg_buffer_free(ptr);
            }
        static new(arg0) {
    return Buffer.__construct(wasm.buffer_new(arg0));
}
as_ptr() {
    return wasm.buffer_as_ptr(this.ptr);
}
}

export class EscapeTimeRunner {

                static __construct(ptr) {
                    return new EscapeTimeRunner(ptr);
                }

                constructor(ptr) {
                    this.ptr = ptr;
                }

            free() {
                const ptr = this.ptr;
                this.ptr = 0;
                wasm.__wbg_escapetimerunner_free(ptr);
            }
        static new(arg0, arg1) {
    const ptr0 = arg0.ptr;
    arg0.ptr = 0;
    const ptr1 = arg1.ptr;
    arg1.ptr = 0;
    return EscapeTimeRunner.__construct(wasm.escapetimerunner_new(ptr0, ptr1));
}
update(arg0, arg1) {
    const ptr0 = arg0.ptr;
    arg0.ptr = 0;
    const ptr1 = arg1.ptr;
    arg1.ptr = 0;
    return wasm.escapetimerunner_update(this.ptr, ptr0, ptr1);
}
has_next() {
    return (wasm.escapetimerunner_has_next(this.ptr)) !== 0;
}
load_next(arg0) {
    return wasm.escapetimerunner_load_next(this.ptr, arg0.ptr);
}
last_chunk_loaded_re() {
    return wasm.escapetimerunner_last_chunk_loaded_re(this.ptr);
}
last_chunk_loaded_im() {
    return wasm.escapetimerunner_last_chunk_loaded_im(this.ptr);
}
}

let slab = [];

let slab_next = 0;

function addHeapObject(obj) {
    if (slab_next === slab.length)
        slab.push(slab.length + 1);
    const idx = slab_next;
    const next = slab[idx];

    slab_next = next;

    slab[idx] = { obj, cnt: 1 };
    return idx << 1;
}

let stack = [];

function getObject(idx) {
    if ((idx & 1) === 1) {
        return stack[idx >> 1];
    } else {
        const val = slab[idx >> 1];

    return val.obj;

    }
}

export function __wbindgen_object_clone_ref(idx) {
    // If this object is on the stack promote it to the heap.
    if ((idx & 1) === 1)
        return addHeapObject(getObject(idx));

    // Otherwise if the object is on the heap just bump the
    // refcount and move on
    const val = slab[idx >> 1];
    val.cnt += 1;
    return idx;
}

function dropRef(idx) {

    let obj = slab[idx >> 1];

    obj.cnt -= 1;
    if (obj.cnt > 0)
        return;

    // If we hit 0 then free up our space in the slab
    slab[idx >> 1] = slab_next;
    slab_next = idx >> 1;
}

export function __wbindgen_object_drop_ref(i) { dropRef(i); }

let cachedDecoder = new TextDecoder('utf-8');

let cachedUint8Memory = null;
function getUint8Memory() {
    if (cachedUint8Memory === null ||
        cachedUint8Memory.buffer !== wasm.memory.buffer)
        cachedUint8Memory = new Uint8Array(wasm.memory.buffer);
    return cachedUint8Memory;
}

function getStringFromWasm(ptr, len) {
    return cachedDecoder.decode(getUint8Memory().slice(ptr, ptr + len));
}

export function __wbindgen_string_new(p, l) {
    return addHeapObject(getStringFromWasm(p, l));
}

export function __wbindgen_number_new(i) { return addHeapObject(i); }

export function __wbindgen_number_get(n, invalid) {
    let obj = getObject(n);
    if (typeof(obj) === 'number')
        return obj;
    getUint8Memory()[invalid] = 1;
    return 0;
}

export function __wbindgen_undefined_new() { return addHeapObject(undefined); }

export function __wbindgen_null_new() {
    return addHeapObject(null);
}

export function __wbindgen_is_null(idx) {
    return getObject(idx) === null ? 1 : 0;
}

export function __wbindgen_is_undefined(idx) {
    return getObject(idx) === undefined ? 1 : 0;
}

export function __wbindgen_boolean_new(v) {
    return addHeapObject(v === 1);
}

export function __wbindgen_boolean_get(i) {
    let v = getObject(i);
    if (typeof(v) === 'boolean') {
        return v ? 1 : 0;
    } else {
        return 2;
    }
}

export function __wbindgen_symbol_new(ptr, len) {
    let a;
    if (ptr === 0) {
        a = Symbol();
    } else {
        a = Symbol(getStringFromWasm(ptr, len));
    }
    return addHeapObject(a);
}

export function __wbindgen_is_symbol(i) {
    return typeof(getObject(i)) === 'symbol' ? 1 : 0;
}

let cachedEncoder = new TextEncoder('utf-8');

function passStringToWasm(arg) {

    const buf = cachedEncoder.encode(arg);
    const ptr = wasm.__wbindgen_malloc(buf.length);
    getUint8Memory().set(buf, ptr);
    return [ptr, buf.length];
}

let cachedUint32Memory = null;
function getUint32Memory() {
    if (cachedUint32Memory === null ||
        cachedUint32Memory.buffer !== wasm.memory.buffer)
        cachedUint32Memory = new Uint32Array(wasm.memory.buffer);
    return cachedUint32Memory;
}

export function __wbindgen_string_get(i, len_ptr) {
    let obj = getObject(i);
    if (typeof(obj) !== 'string')
        return 0;
    const [ptr, len] = passStringToWasm(obj);
    getUint32Memory()[len_ptr / 4] = len;
    return ptr;
}

export function __wbindgen_throw(ptr, len) {
    throw new Error(getStringFromWasm(ptr, len));
}

