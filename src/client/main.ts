import * as $ from 'jquery';
import * as Rails from 'rails-ujs';
import { Application } from 'stimulus';
import FieldValidatorController from './controllers/field-validator-controller';
import ValidationMessagesController from './controllers/validation-messages-controller';

import * as live from './live';
import * as payment from './payment';
import * as splash from './splash';

const pages = [live, payment, splash];

$(document).ready(() => {
  pages.forEach(f => f.start());
});

document.addEventListener('DOMContentLoaded', _ => {
  const buttonsWithMethod = Array.from(document.getElementsByTagName('button')).filter(element =>
    element.attributes.getNamedItem('data-method') !== null
  );
  buttonsWithMethod.forEach(element => {
    element.addEventListener('click', event => {
      event.preventDefault();
      fetch(element.attributes.getNamedItem('data-action').value, {
        method: element.attributes.getNamedItem('data-method').value
      }).then(response => location.assign(response.url));
    });
  });
});
Rails.start();

const application = Application.start();
application.register('field-validator', FieldValidatorController);
application.register('validation-messages', ValidationMessagesController);
