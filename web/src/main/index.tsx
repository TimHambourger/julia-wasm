import S from 's-js';
import * as Surplus from 'surplus';

import { HashSignal } from './hashSignal';
import { parseQueryString, formatQueryString } from './queryHandler';
import { App } from './app';
import { AppView } from './view';

const
    mounted = S.data(false),
    view = S.root(() => {
        const
            hash = HashSignal(),
            query = S(() => {
                // NOTE: Referencing hash.change instead of hash to prevent
                // cycle with two-way binding below. Same trick used in surplus-realword by Adam Haile:
                // https://github.com/adamhaile/surplus-realworld/blob/master/src/main.tsx
                const idx = hash.change().indexOf('?');
                return idx >= 0 ? hash.change().slice(idx + 1) : '';
            }),
            opts = parseQueryString(S.sample(query)),
            app = App((window as any).WORKER_URL, opts);

        // Two-way binding btwn URL hash and App options
        S(() => hash('#?' + formatQueryString(app.currentOpts())));
        S.on(query, () => app.updateOpts(parseQueryString(query())));

        return <AppView app={app} mounted={mounted} />
    });
document.querySelector('#app')!.appendChild(view);
mounted(true);
