const { fields, validators, widgets, create: createForm } = require('forms');
const { field: fileField, typeValidator: fileTypeValidator, sizeValidator: fileSizeValidator } = require('./file-field');

function textareaField(label, maxlength) {
  return fields.string({
    widget: widgets.textarea({
      maxlength,
    }),
    label,
    validators: [
      validators.maxlength(maxlength),
    ],
    cssClasses,
  })
}

exports.maxFieldSize = 1024 * 1024 * 2; // 2mb

const cssClasses = {
  error: [ 'form-error-message' ],
  label: [ 'form-label' ],
  field: [ 'form-row' ],
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
      label: 'Upload your CV',
      required: validators.required('This field is requred'),
      validators: validateFile ? [
        fileTypeValidator('application/pdf', 'Please upload a PDF'),
        fileSizeValidator(exports.maxFieldSize, 'Your CV must be no larger than 2mb'),
      ] : [],
      cssClasses,
    }),
    development: fields.array({
      label: 'Where do you see yourself fitting in the development process? Tick all that apply.',
      widget: widgets.multipleCheckbox(),
      required: validators.required('This field is required'),
      choices: {
        development: 'Development',
        design: 'Design',
        product_management: 'Product Management',
        none: 'I\'m not sure!',
      },
      cssClasses,
    }),
    links: textareaField('Give us some links, so we can learn more about you', 1000),
    learn: textareaField('What do you want to learn from this event?', 500),
    interests: textareaField('What, in general, are you interested in?', 500),
    accomplishment: textareaField('What is a recent accomplishment that you\'re proud of?', 500),
    team_apply: fields.boolean({
      label: 'Are you applying as part of a team?',
      cssClasses,
    }),
    team_placement: fields.boolean({
      label: 'If not, would you like us to place you in a team?',
      cssClasses,
    }),
    terms: fields.boolean({
      label: 'Accept our terms and conditions yo',
      required: validators.matchValue(() => true, 'You must accept our terms and conditions to apply'),
      cssClasses,
    }),
  }, {
    validatePastFirstError: true,
  });
}