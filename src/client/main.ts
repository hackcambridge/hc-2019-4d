import * as $ from 'jquery';
import * as Rails from 'rails-ujs';
import { Application } from 'stimulus';
import EmailSignUpController from './controllers/email-sign-up-controller';
import FieldValidatorController from './controllers/field-validator-controller';
import ValidationMessagesController from './controllers/validation-messages-controller';

import * as live from './live';

const pages = [live];

$(document).ready(() => {
  pages.forEach(f => f.start());
});

Rails.start();

const application = Application.start();
application.register('email-sign-up', EmailSignUpController);
application.register('field-validator', FieldValidatorController);
application.register('validation-messages', ValidationMessagesController);

export interface UJSEvent<Data> extends Event {
  detail: [Data, string, XMLHttpRequest];
}
