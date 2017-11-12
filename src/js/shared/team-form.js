const { fields, validators, widgets, create: createForm } = require('forms');

function textField(label, maxlength, options = { }) {
  return fields.string(Object.assign({ }, options, {
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

const cssClasses = {
  error: [ ],
  label: [ ],
  field: [ ],
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
    memberB: textField('B', 256, Object.assign({ required: requiredField, placeholder: 'Enter the Application ID' }, defaults.memberB)),
    memberC: textField('C', 256, Object.assign({ placeholder: 'Enter the Application ID' }, defaults.memberC)),
    memberD: textField('D', 256, Object.assign({ placeholder: 'Enter the Application ID' }, defaults.memberD)),
  }, {
    validatePastFirstError: true,
  });
};