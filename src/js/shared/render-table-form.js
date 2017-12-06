const tag = require('forms/lib/tag');

const MULTIPLE_FIELD_TYPES = ['multipleCheckbox', 'multipleRadio'];

function isMultipleField(type) {
  return MULTIPLE_FIELD_TYPES.includes(type);
}

module.exports = function (name, field, options = { }) {
  const widgetHtml = field.widget.toHTML(name, field);
  const innerContent = isMultipleField(field.widget.type) ? tag('td', { }, widgetHtml) : widgetHtml;
  const tableData = tag('td', { classes: [ field.classes().join(' '), ''], required: !!field.required }, [
    field.note ? tag('p', { classes: ['form-control-note'] }, field.note) : '',
    innerContent,
  ].join(''));
  return tag('tr', { classes: [ field.classes().join(' '), ''], required: !!field.required }, [
    tag('td', { classes: [''] }, field.label),
    tableData,
    tag('td', { classes: ['error'] }, field.errorHTML()),
  ].join(''));
};
