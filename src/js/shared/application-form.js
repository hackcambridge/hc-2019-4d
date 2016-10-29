const { fields, validators, widgets, create: createForm } = require('forms');

function textareaField(label, maxlength) {
  return fields.string({
    widget: widgets.textarea({
      maxlength,
    }),
    label,
    validators: [
      validators.maxlength(maxlength),
    ],
  })
}

module.exports = function createApplicationForm() {
  return createForm({
    cv: fields.string({
      label: 'Upload your CV',
      required: validators.required('This field is requred'),
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
    }),
    links: textareaField('Give us some links, so we can learn more about you', 1000),
    learn: textareaField('What do you want to learn from this event?', 500),
    interests: textareaField('What, in general, are you interested in?', 500),
    accomplishment: textareaField('What is a recent accomplishment that you\'re proud of?', 500),
    team_apply: fields.boolean({
      label: 'Are you applying as part of a team?',
    }),
    team_placement: fields.boolean({
      label: 'If not, would you like us to place you in a team?',
    }),
    terms: fields.boolean({
      label: 'Accept our terms and conditions yo',
      required: validators.matchValue(() => true, 'You must accept our terms and conditions to apply'),
    }),
  }, {
    validatePastFirstError: true,
  });
}