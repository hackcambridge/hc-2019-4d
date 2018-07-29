import * as $ from 'jquery';

import * as apply from './apply';
import * as live from './live';
import * as payment from './payment';
import * as splash from './splash';

let pages = [apply, live, payment, splash];

$(document).ready(() => {
  pages.forEach((f) => f.start());
});
