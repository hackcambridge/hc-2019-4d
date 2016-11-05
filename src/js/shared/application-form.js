const { fields, validators, widgets, create: createForm } = require('forms');
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

exports.maxFieldSize = 1024 * 1024 * 2; // 2mb

const cssClasses = {
  error: [ 'form-error-message' ],
  label: [ 'form-label-longform' ],
  field: [ 'form-row', 'form-row-margin' ],
};

/**
 * Create the object representation of our application form.
 *
 * To support client side validation in browsers that don't have sufficient APIs, there is
 * an option to disable file validation.
 */
exports.createApplicationForm = function createApplicationForm(validateFile = true) {
  return createForm({
    cv: fileField({
      label: 'Upload your CV.',
      note: 'PDFs only, 2mb max.',
      required: validators.required('This field is requred'),
      validators: validateFile ? [
        fileTypeValidator('application/pdf', 'Please upload a PDF'),
        fileSizeValidator(exports.maxFieldSize, 'Your CV must be no larger than 2mb'),
      ] : [],
      cssClasses,
    }),
    development: fields.array({
      label: 'Where do you see yourself fitting in the development process?',
      note: 'Tick all that apply.',
      widget: multiCheckboxWidget(),
      required: validators.required('This field is required'),
      choices: {
        development: 'Development',
        design: 'Design',
        product_management: 'Product Management',
        none: 'I\'m not sure!',
      },
      cssClasses,
    }),
    links: textareaField('What are some links that we can use to learn more about you?', 500, { 
      note: 'For example: GitHub, LinkedIn or your personal website. Please put each link on a new line.', 
      placeholder: 'https://github.com/hackcambridge' 
    }),
    learn: textareaField('What do you want to learn from this event?', 500),
    interests: textareaField('What, in general, are you interested in?', 500),
    accomplishment: textareaField('What is a recent accomplishment that you\'re proud of?', 500),
    team_apply: fields.boolean({
      widget: checkboxWidget('Yes, I am applying as part of a team. One of our members will fill out the team application form.'),
      note: 'We will not process your application until you have been entered into a team application form (after submit this form).',
      label: 'Are you applying as part of a team?',
      cssClasses,
    }),
    team_placement: fields.boolean({
      widget: checkboxWidget('Yes, please place me in a team'),
      note: 'We can suggest a team for you before the event. You can always change this by contacting us.',
      label: 'If not, would you like us to place you in a team?',
      cssClasses,
    }),
    terms: fields.boolean({
      widget: checkboxWidget('I accept the terms and conditions and privacy policy'),
      label: 'Do you accept our <a href="/terms" target="_blank">terms and conditions</a> and <a href="/privacy" target="_blank">privacy policy</a>?',
      note: 'This includes the <a href="http://static.mlh.io/docs/mlh-code-of-conduct.pdf" target="_blank">MLH Code of Conduct</a>.',
      required: validators.matchValue(() => true, 'You must accept our terms and conditions to apply'),
      cssClasses,
    }),
  }, {
    validatePastFirstError: true,
  });
}