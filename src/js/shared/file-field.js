const tag = require('forms/lib/tag');
const { fields, widgets } = require('forms');

exports.field = function field(userOptions = { }) {
  const uploadField = fields.string(Object.assign({ 
    widget: exports.widget(userOptions.attrs)
  }, userOptions));

  uploadField.parse = (rawData) => {
    if (rawData != null) {
      return {
        filename: rawData.originalname,
        mimetype: rawData.mimetype,
        size: rawData.size,
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
  const ignoreAttrs = ['id', 'name', 'class', 'classes', 'type', 'value'];
  const getUserAttrs = (attributesToFilter) => Object.keys(attributesToFilter)
    .filter(key => ((legalAttrs.includes(key)) || dataRegExp.text(key) || ariaRegExp.test(key)))
    .reduce((attributes, key) => {
      attributes[key] = attributesToFilter[key];
      return attributes;
    }, { });
  return function (options = { }) {
    const userAttrs = getUserAttrs(options);
    const widget = {
        classes: options.classes,
        type,
        formatValue: value => value || null,
        toHTML(name, field = { }) {
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

exports.widget = inputWidget('file');

exports.typeValidator = function validator(mimetype, message = `This file must be of type ${mimetype}`) {
  return (form, field, callback) => {
    if (field.data.mimetype === mimetype) {
      callback();
    } else {
      callback(message);
    }
  };
};

exports.sizeValidator = function validator(size, message = `File is too big`) {
  return (form, field, callback) => {
    if (field.data.size <= size) {
      callback();
    } else {
      callback(message);
    }
  }
}