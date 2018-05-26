import S, { DataSignal } from 's-js';
import { IComplex } from '../shared/IComplex';
import { MemoryPool } from '../shared/memoryPool';

export type SimpleMapFn<T, U>   = (data : T, chunkId : IComplex) => U;
export type ReducingMapFn<T, U> = (data : T, chunkId : IComplex, prev : U) => U;
export type SeedFactory<T>      = (chunkId : IComplex) => T;

export interface IBundle<T> {
    /**
     * Get a function that returns the value currently held at the given ChunkId.
     */
    get(chunkId : IComplex) : () => T;

    /**
     * Produce a new bundle by applying a function to each chunk of the current bundle.
     */
    map<U>(fn : SimpleMapFn<T, U>) : IBundle<U>;
    map<U>(fn : ReducingMapFn<T, U>, seedFactory : SeedFactory<U>) : IBundle<U>;

    /**
     * "Crack" the bundle by returning all data currently held within it.
     * Useful for, e.g., reclaiming memory.
     * Calling code should assume that this does NOT subscribe to any signals held w/in the bundle.
     * Implementations should use S.sample as needed to guarantee this.
     */
    crack() : T[];
}

abstract class Bundle<T> implements IBundle<T> {
    abstract get(chunkId : IComplex) : () => T;
    protected abstract currentSlots() : (() => T)[];

    map<U>(fn : SimpleMapFn<T, U>) : IBundle<U>;
    map<U>(fn : ReducingMapFn<T, U>, seedFactory : SeedFactory<U>) : IBundle<U>;
    map<U>(fn : ReducingMapFn<T, U>, seedFactory? : SeedFactory<U>) : IBundle<U> {
        if (seedFactory === undefined) return new MappedBundle(this, fn as SimpleMapFn<T, U>);
        return new MappedBundle(this, fn, seedFactory);
    }

    crack() {
        return this.currentSlots().map(slot => S.sample(slot));
    }
}

export class DataBundle<T> extends Bundle<T | null> {
    private readonly chunks : Map<string, DataSignal<T | null>>;

    constructor() {
        super();
        this.chunks = new Map<string, DataSignal<T | null>>();
    }

    get(chunkId : IComplex) {
        const
            key = chunkIdKey(chunkId),
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
    value : () => T;
}

export class MappedBundle<T, U> extends Bundle<U> {
    private readonly chunks : Map<string, MappedBundleChunk<U>>;

    constructor(original : IBundle<T>, mapFn : SimpleMapFn<T, U>);
    constructor(original : IBundle<T>, mapFn : ReducingMapFn<T, U>, seedFactory : SeedFactory<U>);
    constructor(
        private readonly original : IBundle<T>,
        private readonly mapFn : ReducingMapFn<T, U>,
        private readonly seedFactory? : SeedFactory<U>
    ) {
        super();
        this.chunks = new Map<string, MappedBundleChunk<U>>();

        // All computations created by get below become "adoptive" children of whatever
        // computation/root constructed this MappedBundle.
        S.cleanup(() => {
            this.chunks.forEach(({ dispose }) => dispose());
        });
    }

    get(chunkId : IComplex) {
        const key = chunkIdKey(chunkId);
        let chunk = this.chunks.get(key);
        if (!chunk) {
            let dispose! : () => void;
            const
                upstream = this.original.get(chunkId),
                value = S.root(_dispose => {
                    dispose = _dispose;
                    return this.seedFactory ?
                        S(prev => (this.mapFn as ReducingMapFn<T, U>)(upstream(), chunkId, prev), this.seedFactory!(chunkId)) :
                        S(() =>   (this.mapFn as SimpleMapFn<T, U>)  (upstream(), chunkId));
                });
            chunk = { dispose, value };
            this.chunks.set(key, chunk);
        }
        return chunk.value;
    }

    protected currentSlots() {
        const slots = [] as (() => U)[];
        this.chunks.forEach(c => slots.push(c.value));
        return slots;
    }
}

function chunkIdKey(chunkId : IComplex) {
    return `${chunkId.re}+${chunkId.im}i`;
}
