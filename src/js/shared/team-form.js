const { fields, validators, widgets, create: createForm } = require('forms');

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
exports.createTeamForm = function createTeamForm(defaults = { }) {
  for (const def in defaults) {
    defaults[def] = { value: defaults[def] };
  }
  return createForm({
    memberB: textField('Member B application ID:', 256, Object.assign({ required: requiredField }, defaults.memberB)),
    memberC: textField('Member C application ID:', 256, defaults.memberC),
    memberD: textField('Member D application ID:', 256, defaults.memberD),
  }, {
    validatePastFirstError: true,
  });
};