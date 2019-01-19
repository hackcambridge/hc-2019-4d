import * as $ from 'jquery';
import { Application } from 'stimulus';

import AlertController from './controllers/alert-controller';
import ColorController from './controllers/color-controller';
import CountdownController from './controllers/countdown-controller';
import EmailSignUpController from './controllers/email-sign-up-controller';
import EventsController from './controllers/events-controller';
import FieldValidatorController from './controllers/field-validator-controller';
import SocialFeedController from './controllers/social-feed-controller';
import ValidationMessagesController from './controllers/validation-messages-controller';
import { UJS } from './ujs';

import * as live from './live';

const pages = [live];

$(document).ready(() => {
  pages.forEach(f => f.start());
});

UJS.start();

const application = Application.start();
application.register('email-sign-up', EmailSignUpController);
application.register('field-validator', FieldValidatorController);
application.register('validation-messages', ValidationMessagesController);
application.register('alert', AlertController);
application.register('color', ColorController);
application.register('events', EventsController);
application.register('social-feed', SocialFeedController);
application.register('countdown', CountdownController);
