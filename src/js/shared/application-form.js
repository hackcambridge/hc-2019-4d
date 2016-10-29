const forms = require('forms');
const { fields, validators, widgets } = forms;

module.exports = function createForm() {
  return forms.create({
    cv: fields.string({
      label: 'Upload your CV',
      required: validators.required(),
    }),
    development: fields.array({
      label: 'Where do you see yourself fitting in the development process? Tick all that apply.',
      require: validators.required(),
      choices: {
        development: 'Development',
        design: 'Design',
        product_management: 'Product Management',
        none: 'I\'m not sure!',
      },
    }),
    links: fields.string({
      widget: widgets.textarea(),
      label: 'Give us some links, so we can learn more about you',
    }),
    learn: fields.string({
      widget: widgets.textarea(),
      label: 'What do you want to learn from this event?'
    }),
    interests: fields.string({
      widget: widgets.textarea(),
      label: 'What, in general, are you interested in?',
    }),
    accomplishment: fields.string({
      widget: widgets.textarea(),
      label: 'What is a recent accomplishment that you\'re proud of?',
    }),
    team_apply: fields.boolean({
      label: 'Are you applying as part of a team?'
    }),
    team_placement: fields.boolean({
      label: 'If not, would you like us to place you in a team? '
    }),
    terms: fields.boolean({
      label: 'Accept our terms and conditions yo',
      required: validators.required(),
    }),
  });
}