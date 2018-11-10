import * as tag from 'forms/lib/tag';

export function checkboxWidget(label, { value = 'on' } = { }) {
  return {
    toHTML(name, field) {
      return tag('label', { classes: [ 'form-label-checkbox' ]}, tag('input', {
        type: 'checkbox',
        checked: !!field.value,
        value,
        id: field.id === false ? false : (field.id || true),
        name,
      }) + ` ${label}`);
    }
  };
};

export function multiCheckboxWidget(options = { }) {
  return {
    toHTML(name, field) {
      return Object.keys(field.choices).reduce((result, choiceKey) => {
        const id = field.id === false ? false : (field.id ? field.id + '_' + choiceKey : 'id_' + name + '_' + choiceKey);
        const checked = field.value && (Array.isArray(field.value) ? field.value.some(v => String(v) === String(choiceKey)) : String(field.value) === String(choiceKey));

        return result + checkboxWidget(field.choices[choiceKey], { value: choiceKey }).toHTML(name, { id, value: checked });
      }, '');
    }
  };
};