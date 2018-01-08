const { fields, validators, widgets, create: createForm } = require('forms');

const cssClasses = {
  error: [ 'error_msg form-error-message' ],
  label: [ 'form-label-longform' ],
  field: [ 'form-row', 'form-row-margin' ],
};

function extendOptions(options, newOptions) {
  return Object.assign({ }, options, newOptions);
}

function textField(label, maxlength, options = { }) {
  return fields.string(extendOptions(options, {
    widget: widgets.text({
      maxlength,
      classes: [ 'pixel' ],
      placeholder: options.placeholder,
    }),
    label,
    validators: [
      validators.maxlength(maxlength),
    ],
    cssClasses,
  }));
}

const requiredField = validators.required('This field is required.');

/**
 * Create the object representation of our application form.
 *
 * To support client side validation in browsers that don't have sufficient APIs, there is
 * an option to disable file validation.
 */
exports.createTeamForm = function createTeamForm(defaults = { }) {
  for (const def in defaults) {
    defaults[def] = { value: defaults[def] };
  }
  return createForm({
    memberB: textField('B', 256, extendOptions(defaults.memberB, { required: requiredField, placeholder: 'Enter the Application ID' })),
    memberC: textField('C', 256, extendOptions(defaults.memberC, { placeholder: 'Enter the Application ID' })),
    memberD: textField('D', 256, extendOptions(defaults.memberD, { placeholder: 'Enter the Application ID' })),
  }, {
    validatePastFirstError: true,
  });
};