import { Application } from 'stimulus'
import FieldValidatorController from './controllers/field-validator-controller'
import ValidationMessagesController from './controllers/validation-messages-controller'
import * as $ from 'jquery';

import * as live from './live';
import * as payment from './payment';
import * as splash from './splash';

let pages = [live, payment, splash];

$(document).ready(() => {
  pages.forEach((f) => f.start());
});

const application = Application.start();
application.register('field-validator', FieldValidatorController);
application.register('validation-messages', ValidationMessagesController);
