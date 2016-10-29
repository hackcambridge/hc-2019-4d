const tag = require('forms/lib/tag');

const MULTIPLE_FIELD_TYPES = ['multipleCheckbox', 'multipleRadio'];

function isMultipleField(type) {
  return MULTIPLE_FIELD_TYPES.includes(type);
}

module.exports = function (name, field, options = { }) {
  const errorHtml = options.hideError ? '' : field.errorHTML();
  const widgetHtml = field.widget.toHTML(name, field);
  const innerContent = isMultipleField(field.widget.type) ? tag('div', { }, widgetHtml) : widgetHtml;

  return tag('div', { classes: field.classes(), required: !!field.required }, [
    field.labelHTML(name, field.id),
    options.errorAfterField ? '' : errorHtml,
    innerContent,
    options.errorAfterField ? errorHtml : '',
  ].join(''));
}
