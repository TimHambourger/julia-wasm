import S from 's-js';
import * as Surplus from 'surplus';

import { App } from './model';
import { AppView } from './view';

const view = S.root(() => <AppView app={App()} />);
document.querySelector('#app')!.appendChild(view);
