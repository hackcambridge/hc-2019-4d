import * as tag from 'forms/lib/tag';

const MULTIPLE_FIELD_TYPES = ['multipleCheckbox', 'multipleRadio'];

function isMultipleField(type) {
  return MULTIPLE_FIELD_TYPES.includes(type);
}

export default function (name, field, options = { }) {
  const widgetHtml = field.widget.toHTML(name, field);
  const innerContent = isMultipleField(field.widget.type) ? tag('fieldset', { }, widgetHtml) : widgetHtml;
  const fieldSet = tag('fieldset', { classes: [ field.classes().join(' '), 'unit column'], required: !!field.required }, [
    tag('legend', { classes: ['form-control-legend'] }, field.label),
    field.note ? tag('p', { classes: ['form-control-note'] }, field.note) : '',
    tag('p', { classes: ['error'] }, field.errorHTML()),
    innerContent,
  ].join(''));
  return tag('div', { rows: [field.row_units] }, [
    fieldSet
  ].join(''));
};
