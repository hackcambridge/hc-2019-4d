const { fields, validators, widgets, create: createForm } = require('forms');
const countries = require('country-list')();
const { field: fileField, typeValidator: fileTypeValidator, sizeValidator: fileSizeValidator } = require('./file-field');
const { checkboxWidget, multiCheckboxWidget } = require('./checkbox');

function textareaField(label, maxlength, options = { }) {
  return fields.string(Object.assign({ }, options, {
    widget: widgets.textarea({
      maxlength,
      classes: [ 'form-control-longform' ],
      placeholder: options.placeholder,
    }),
    label,
    validators: [
      validators.maxlength(maxlength),
    ],
    cssClasses,
  }));
}


const countryChoices = { };
/**
 * Allows us to optimise the list creation by only making it once, lazily.
 */
let countryChoicesCreated = false;
function createCountryChoices() {
  if (countryChoicesCreated) {
    return countryChoices;
  }

  countryChoices[''] = 'Choose a Country';

  countries.getData().forEach(({ code, name }) => {
    countryChoices[code] = name;
  });

  countryChoicesCreated = true;

  return countryChoices;
}

exports.maxFieldSize = 1024 * 1024 * 2; // 2mb

const cssClasses = {
  error: [ 'form-error-message' ],
  label: [ 'form-label-longform' ],
  field: [ 'form-row', 'form-row-margin' ],
};

const requiredField = validators.required('This field is required.');

/**
 * Create the object representation of our application form.
 *
 * To support client side validation in browsers that don't have sufficient APIs, there is
 * an option to disable file validation.
 */
exports.createApplicationForm = function createApplicationForm(validateFile = true) {
  return createForm({
    cv: fileField({
      label: 'Upload your CV:',
      note: 'PDFs only — 2 MB maximum size.',
      required: requiredField,
      validators: validateFile ? [
        fileTypeValidator('application/pdf', 'Please upload a PDF.'),
        fileSizeValidator(exports.maxFieldSize, 'Your CV must be no larger than 2 MB.'),
      ] : [],
      cssClasses,
    }),
    countryTravellingFrom: fields.string({
      widget: widgets.select(),
      label: 'Where will you be travelling from before you reach Cambridge?',
      note: 'This may or may not be where you live at the moment.',
      required: requiredField,
      choices: createCountryChoices(),
      cssClasses,
    }),
    development: fields.array({
      label: 'Where do you see yourself fitting into the development process?',
      note: 'Tick all that apply.',
      widget: multiCheckboxWidget(),
      required: requiredField,
      choices: {
        development: 'Development',
        design: 'Design',
        product_management: 'Product Management',
        unknown: 'I\'m not sure!',
      },
      validators: [
        (form, field, callback) => {
          if ((field.data.includes('unknown')) && (field.data.length > 1)) {
            callback('You can\'t have an answer and not be sure!');
          } else {
            callback();
          }
        },
      ],
      cssClasses,
    }),
    learn: textareaField('What do you want to learn from this event?', 500, {
      required: requiredField,
    }),
    interests: textareaField('What interests you?', 500, {
      note: 'This can be anything at all — it doesn\'t have to be technology-related!',
      required: requiredField,
    }),
    accomplishment: textareaField('Tell us about a recent accomplishment that you\'re proud of:', 500, {
      required: requiredField,
    }),
    links: textareaField('Are there any links we can visit to get to know you better?', 500, { 
      note: 'For example: GitHub, LinkedIn or your personal website. Please put each link on a new line.', 
      placeholder: 'https://github.com/hackcambridge' 
    }),
    team_apply: fields.boolean({
      label: 'Are you applying as part of a team?',
      note: 'We will not process your application until you have been entered into a team via the application form (after submitting this form).',
      widget: checkboxWidget('Yes, I am applying as part of a team. One of our members will fill out the team application form.'),
      cssClasses,
    }),
    team_placement: fields.boolean({
      label: 'If not, would you like us to place you in a team?',
      note: 'We can suggest a team for you before the event. You can always change this by contacting us.',
      widget: checkboxWidget('Yes, please place me in a team!'),
      validators: [
        (form, field, callback) => {
          if ((field.data) && (form.fields.team_apply.data)) {
            callback('We can\'t place you in a team if you are already applying as part of a team!');
          } else {
            callback();
          }
        },
      ],
      cssClasses,
    }),
    terms: fields.boolean({
      label: 'Do you accept our <a href="/terms" target="_blank">terms and conditions</a> and <a href="/privacy" target="_blank">privacy policy</a>?',
      note: 'This includes the <a href="http://static.mlh.io/docs/mlh-code-of-conduct.pdf" target="_blank">MLH Code of Conduct</a>.',
      widget: checkboxWidget('I accept the terms and conditions and the privacy policy.'),
      required: validators.matchValue(() => true, 'You must accept our terms and conditions to apply.'),
      cssClasses,
    }),
  }, {
    validatePastFirstError: true,
  });
};