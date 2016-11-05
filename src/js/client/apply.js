const $ = require('jquery');
const { createApplicationForm } = require('js/shared/application-form');
const renderForm = require('js/shared/render-form');

/**
 * jQuery's .serializeArray does not give us file input values. While we can't get useful
 * information about files' content easily, we can get it's name for validation easily.
 *
 * For inspiration, see their implementation: https://github.com/jquery/jquery/blob/master/src/serialize.js
 */
function serializeForm($formElement) {
  const serializedObject = { };

  $formElement.find('select, input, textarea').each((_, element) => {
    const $element = $(element);

    const key = $element.attr('name');
    const value = getFieldValue($element);

    if (($element.attr('type') === 'submit') || (($element.attr('type') === 'checkbox') && !element.checked)) {
      return;
    }

    if (Array.isArray(serializedObject[key])) {
      serializedObject[key].push(value);
    } else if (typeof serializedObject[key] !== 'undefined') {
      serializedObject[key] = [serializedObject[key], value];
    } else {
      serializedObject[key] = value;
    }
  });

  return serializedObject;
}

function getFieldValue($field) {
  if ($field.attr('type') === 'file') {
    const files = $field[0].files;

    if ((files == null) || (files.length == 0)) {
      return null;
    }

    return {
      originalname: files[0].name,
      mimetype: files[0].type,
      size: files[0].size,
    };
  } else {
    return $field.val();
  }
}

module.exports = function applyPage() {
  const supportsFileApi = ($("<input type='file'>").get(0).files) !== undefined;

  $('.apply-form').each(function () {
    const $applyForm = $(this);

    const addFeedbackToForm = (form) => {
      let firstErrorFound = false;
      Object.keys(form.fields).forEach((fieldName) => {
        const $row = $applyForm.find(`[name=${fieldName}]`).closest('.form-row');
        const field = form.fields[fieldName];

        $row.removeClass('error');
        $row.find('.form-error-message').remove();

        if (field.error != null) {
          if (!firstErrorFound) {
            $('html, body').animate({
              scrollTop: $row.offset().top
            }, 500);
            firstErrorFound = true;
          }
          $row.find('.form-label-longform').after(field.errorHTML());
          $row.addClass('error');
        }
      });
    };

    $applyForm.submit((event, { valid } = { }) => {
      // Our form validation is asynchronous (but happens within a few ms).
      // This means that we have to re-submit the form after validation
      // with some kind of indicator that the validation has succeeded
      console.log('yeee');
      if (valid) {
        return true;
      }

      event.preventDefault();
      
      createApplicationForm(supportsFileApi).handle(
        serializeForm($applyForm),
        {
          success: () => $applyForm.trigger('submit', { valid: true }),
          error: addFeedbackToForm,
          empty: addFeedbackToForm,
        }
      );
    });
  });
};