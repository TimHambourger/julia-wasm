import S, { DataSignal } from 's-js';

export interface DraftSignal<T> extends DataSignal<T> {
    commit : () => void;
    revert : () => void;
}

export function draftSignal<T>(original : DataSignal<T>, eq? : (t1 : T, t2 : T) => boolean) : DraftSignal<T> {
    const
        effectiveEq = eq || ((t1, t2) => t1 === t2),
        dirty = S.data(false),
        // We'll enforce the invariant that whenever we set dirty to true,
        // we also set written to a non-null value.
        written = S.data<T | null>(null),
        curr = () => dirty() ? written()! : original(),
        draft = ((val? : T) => {
            if (val === undefined) return curr();
            const _curr = S.sample(curr);
            if (!effectiveEq(val, _curr)) {
                return S.freeze(() => {
                    dirty(true);
                    return written(val);
                });
            } else {
                return _curr;
            }
        }) as DraftSignal<T>;

    draft.commit = () => {
        S.sample(() => {
            if (dirty()) {
                S.freeze(() => {
                    original(written()!);
                    dirty(false);
                })
            }
        });
    };

    draft.revert = () => {
        S.freeze(() => {
            dirty(false);
            written(null); // To free for GC
        });
    };

    return draft;
}
