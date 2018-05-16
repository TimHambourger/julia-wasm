import S from 's-js';
import * as Surplus from 'surplus';

import { HashSignal } from './hashSignal';
import { parseQueryString, formatQueryString } from './queryHandler';
import { App } from './model';
import { AppView } from './view';

const view = S.root(() => {
    const
        hash = HashSignal(),
        query = S(() => {
            const idx = hash().indexOf('?');
            return idx >= 0 ? hash().slice(idx + 1) : '';
        }),
        opts = parseQueryString(S.sample(query)),
        app = App((window as any).WORKER_URL, opts);

    // Two-way binding btwn URL hash and App options
    S(() => hash('#?' + formatQueryString(app.currentOpts())));
    S.on(query, () => app.updateOpts(parseQueryString(query())), undefined, true);

    return <AppView app={app} />
});
document.querySelector('#app')!.appendChild(view);
