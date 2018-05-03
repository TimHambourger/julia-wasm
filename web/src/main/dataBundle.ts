import S, { DataSignal } from 's-js';
import { IComplex } from '../shared/IComplex';
import { MemoryPool } from '../shared/memoryPool';

export interface IBundle<T> {
    /**
     * Get a function that returns the value currently held at the given complex coordinate.
     */
    get(z : IComplex) : () => T | null;
    /**
     * Produce a new bundle by applying a function to each complex coordinate of the current bundle.
     */
    map<U>(fn : (data : T, prev : U | null, z : IComplex) => U) : IBundle<U>;
    /**
     * "Crack" the bundle by returning all data currently held within it.
     * Useful for, e.g., reclaiming memory.
     */
    crack() : T[];
}

abstract class Bundle<T> implements IBundle<T> {
    abstract get(z : IComplex) : () => T | null;
    protected abstract currentSlots() : (() => T | null)[];

    map<U>(fn : (data : T, prev : U | null, z : IComplex) => U) : IBundle<U> {
        return new MappedBundle(this, fn);
    }

    crack() {
        return this.currentSlots().map(slot => slot())
            .filter(s => s !== null)
            .map(s => s!);
    }
}

export class DataBundle<T> extends Bundle<T> {
    private readonly chunks : Map<string, DataSignal<T | null>>;

    constructor() {
        super();
        this.chunks = new Map<string, DataSignal<T | null>>();
    }

    get(z : IComplex) {
        const
            key = zKey(z),
            chunk = this.chunks.get(key) || S.data(null);
        this.chunks.set(key, chunk);
        return chunk;
    }

    protected currentSlots() {
        const slots = [] as (() => T | null)[];
        this.chunks.forEach(c => slots.push(c));
        return slots;
    }
}

interface MappedBundleChunk<T> {
    dispose : () => void;
    value : () => T | null;
}

export class MappedBundle<T, U> extends Bundle<U> {
    private readonly chunks : Map<string, MappedBundleChunk<U>>;

    constructor(
        private readonly original : IBundle<T>,
        private readonly mapFn : (data : T, prev : U | null, z : IComplex) => U
    ) {
        super();
        this.chunks = new Map<string, MappedBundleChunk<U>>();

        // This computation becomes an "adoptive" parent of all mapped chunks
        S(() => {
            S.cleanup(() => {
                this.chunks.forEach(({ dispose }) => dispose());
            });
        });
    }

    get(z : IComplex) {
        const key = zKey(z);
        let chunk = this.chunks.get(key);
        if (!chunk) {
            let dispose : () => void = undefined!;
            const
                upstream = this.original.get(z),
                value = S.root(_dispose => {
                    dispose = _dispose;
                    return S(prev => upstream() === null ? null : this.mapFn(upstream()!, prev, z), null as U | null);
                });
            chunk = { dispose, value };
            this.chunks.set(key, chunk);
        }
        return chunk.value;
    }

    protected currentSlots() {
        const slots = [] as (() => U | null)[];
        this.chunks.forEach(c => slots.push(c.value));
        return slots;
    }
}

function zKey(z : IComplex) {
    return `${z.re}+${z.im}i`;
}
