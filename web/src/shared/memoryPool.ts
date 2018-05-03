export class MemoryPool {
    private stack : ArrayBuffer[];

    constructor(
        // Size in bytes
        public readonly byteLength : number
    ) {
        this.stack = [];
    }

    /**
     * Push a buffer back into the pool for later reuse.
     * Throws if buffer is not at least `this.byteLength` bytes.
     */
    push(buffer : ArrayBuffer) {
        if (buffer.byteLength < this.byteLength) {
            throw new Error(`Can't absorb buffer. byteLength must be at least ${this.byteLength}`);
        }
        this.stack.push(buffer);
    }

    /**
     * Push multiple buffers back into the pool.
     * Throws if any buffer is less than `this.requiredSize()` bytes.
     */
    pushAll(buffers : ArrayBuffer[]) {
        for (let i = 0; i < buffers.length; i++) {
            this.push(buffers[i]);
        }
    }

    /**
     * Acquire a buffer from the pool, if one's available, otherwise constructs a new one
     * with the min byte length.
     */
    acquire() {
        return this.stack.pop() || new ArrayBuffer(this.byteLength);
    }

    /**
     * Empty the pool and return the former contents.
     */
    drain() {
        const stack = this.stack;
        this.stack = [];
        return stack;
    }
}
