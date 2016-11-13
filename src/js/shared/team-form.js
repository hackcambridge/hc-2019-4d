const { fields, validators, widgets, create: createForm } = require('forms');
const { field: fileField, typeValidator: fileTypeValidator, sizeValidator: fileSizeValidator } = require('./file-field');
const { checkboxWidget, multiCheckboxWidget } = require('./checkbox');

function textField(label, maxlength, options = { }) {
  return fields.string(Object.assign({ }, options, {
    widget: widgets.text({
      maxlength,
      classes: [ 'form-control-shortform' ],
      placeholder: options.placeholder,
    }),
    label,
    validators: [
      validators.maxlength(maxlength),
    ],
    cssClasses,
  }));
}

const cssClasses = {
  error: [ 'form-error-message' ],
  label: [ 'form-label-shortform' ],
  field: [ 'form-row', 'form-row-margin' ],
};

const requiredField = validators.required('This field is required.');

/**
 * Create the object representation of our application form.
 *
 * To support client side validation in browsers that don't have sufficient APIs, there is
 * an option to disable file validation.
 */
exports.createTeamForm = function createTeamForm() {
  return createForm({
    memberB: textField('Member B:', 64, {
      required: requiredField,
    }),
    memberC: textField('Member C:', 64),
    memberD: textField('Member D:', 64),
  }, {
    validatePastFirstError: true,
  });
};