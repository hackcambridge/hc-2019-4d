import { Application } from 'stimulus';
import { definitionsFromContext } from 'stimulus/webpack-helpers';

import { UJS } from './ujs';

UJS.start();

const application = Application.start();
const context = require.context('./controllers', true, /\.ts$/);
application.load(definitionsFromContext(context));
