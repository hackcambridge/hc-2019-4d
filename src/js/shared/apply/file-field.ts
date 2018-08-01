import * as tag from 'forms/lib/tag';
import { fields } from 'forms';

export function field(userOptions: any = { }) {
  const uploadField = fields.string(Object.assign({ 
    widget: exports.widget(userOptions.attrs)
  }, userOptions));

  uploadField.parse = (rawData) => {
    if (rawData != null) {
      return {
        filename: rawData.originalname,
        mimetype: rawData.mimetype,
        size: rawData.size,
        location: rawData.location,
      };
    }

    return null;
  };

  return uploadField;
};

function inputWidget(type) {
  // Recreated from https://github.com/caolan/forms/tree/master/lib/widgets.js
  const dataRegExp = /^data-[a-z]+([-][a-z]+)*$/;
  const ariaRegExp = /^aria-[a-z]+$/;
  const legalAttrs = ['autocomplete', 'autocorrect', 'autofocus', 'autosuggest', 'checked', 'dirname', 'disabled', 'tabindex', 'list', 'max', 'maxlength', 'min', 'multiple', 'novalidate', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'step'];
  // TODO: Why are we not using ignoreAttrs like the original function in widgets.js
  // const ignoreAttrs = ['id', 'name', 'class', 'classes', 'type', 'value'];
  const getUserAttrs = (attributesToFilter) => Object.keys(attributesToFilter)
    .filter(key => ((legalAttrs.includes(key)) || dataRegExp.test(key) || ariaRegExp.test(key)))
    .reduce((attributes, key) => {
      attributes[key] = attributesToFilter[key];
      return attributes;
    }, { });
  return function (options: any = { }) {
    const userAttrs = getUserAttrs(options);
    const widget: any = {
      classes: options.classes,
      type,
      formatValue: value => value || null,
      toHTML(name, field: any = { }) {
        return tag('input', [{
          type,
          name: name,
          id: field.id === false ? false : (field.id || true),
          classes: widget.classes,
          value: widget.formatValue(field.value)
        }, userAttrs, widget.attrs || { }]);
      },
      getDataRegExp() {
        return dataRegExp;
      },
      getAriaRegExp() {
        return ariaRegExp;
      }
    };

    return widget;
  };
}

export const widget = inputWidget('file');

export function typeValidator(mimetype, message = `This file must be of type ${mimetype}`) {
  return (form, field, callback) => {
    if (field.data.mimetype === mimetype) {
      callback();
    } else {
      callback(message);
    }
  };
};

export function sizeValidator(size, message = 'File is too big') {
  return (form, field, callback) => {
    if (field.data.size <= size) {
      callback();
    } else {
      callback(message);
    }
  };
};