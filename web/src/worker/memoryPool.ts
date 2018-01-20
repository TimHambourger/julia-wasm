export class MemoryPool {
    private stack : ArrayBuffer[];

    constructor(
        // Size in bytes
        private readonly byteLength : number
    ) {
        this.stack = [];
    }

    requiredSize() {
        return this.byteLength;
    }

    /**
     * Absorb a buffer back into the pool for later reuse.
     * Throws if buffer is not at least `this.requiredSize()` bytes.
     */
    absorb(buffer : ArrayBuffer) {
        if (buffer.byteLength < this.byteLength) {
            throw new Error(`Can't absorb buffer. byteLength must be at least ${this.byteLength}`);
        }
        this.stack.push(buffer);
    }

    /**
     * Absorb multiple buffers back into the pool.
     * Throws if any buffer is less than `this.requiredSize()` bytes.
     */
    absorbAll(buffers : ArrayBuffer[]) {
        for (let i = 0; i < buffers.length; i++) {
            this.absorb(buffers[i]);
        }
    }

    /**
     * Obtain a buffer. Reuses a buffer from the pool if possible, otherwise
     * construcs a new one.
     */
    emit() {
        return this.stack.pop() || new ArrayBuffer(this.byteLength);
    }
}
