// Modeled after https://github.com/adamhaile/surplus-realworld/blob/master/src/app/hashSignal.ts
// But simplified for current needs (e.g. only replaces hash, never assigns).

import S from 's-js';

export function HashSignal() {
    const hash = S.value(window.location.hash);

    // Replace url when hash changes
    S.on(hash, () => window.location.replace(hash()), undefined, true);

    // Update hash signal on hashchange event
    const onHashChange = () => {
        if ((window.location.hash || '#') !== hash()) {
            hash(window.location.hash || '#');
        }
    };
    window.addEventListener('hashchange', onHashChange);
    S.cleanup(() => window.removeEventListener('hashchange', onHashChange));

    return hash;
}
