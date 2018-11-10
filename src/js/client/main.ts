import * as $ from 'jquery';
import { Application } from "stimulus"

//import * as apply from './apply';
import * as live from './live';
import * as payment from './payment';
import * as splash from './splash';

let pages = [live, payment, splash];

$(document).ready(() => {
  pages.forEach((f) => f.start());
});

import FieldValidatorController from './controllers/field-validator-controller';
const application = Application.start();
application.register('field-validator', FieldValidatorController);
