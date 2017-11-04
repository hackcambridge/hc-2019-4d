const tag = require('forms/lib/tag');

const MULTIPLE_FIELD_TYPES = ['multipleCheckbox', 'multipleRadio'];

function isMultipleField(type) {
  return MULTIPLE_FIELD_TYPES.includes(type);
}

module.exports = function (name, field, options = { }) {
  const widgetHtml = field.widget.toHTML(name, field);
  const innerContent = isMultipleField(field.widget.type) ? tag('fieldset', { }, widgetHtml) : widgetHtml;

  return tag('fieldset', { classes: field.classes(), required: !!field.required }, [
    tag('legend',{ classes: ['form-control-legend'] },field.label),
    field.note ? tag('p', { classes: ['form-control-note'] }, field.note) : '',
    field.errorHTML(),
    innerContent,
  ].join(''));
};
