const $ = require('jquery');
const createApplicationForm = require('js/shared/application-form');
const renderForm = require('js/shared/render-form');

function serializedArrayToObject(serializedArray) {
  const serializedObject = { };

  serializedArray.forEach((value) => {
    serializedObject[value.name] = value.value;
  });

  return serializedObject;
}

module.exports = function applyPage() {
  $('.apply-form').each(function () {
    const $applyForm = $(this);

    const rerenderForm = (form) => {
      $(this).find('.form-content').html(form.toHTML(renderForm));
    };

    $applyForm.submit((event, { valid } = { }) => {
      // Our form validation is asynchronous (but happens within a few ms).
      // This means that we have to re-submit the form after validation
      // with some kind of indicator that the validation has succeeded

      if (valid) {
        return true;
      }

      event.preventDefault();
      
      createApplicationForm().handle(
        serializedArrayToObject($applyForm.serializeArray()),
        {
          success: () => $applyForm.trigger('submit', { valid: true }),
          error: rerenderForm,
          empty: rerenderForm,
        }
      );
    });
  });
};