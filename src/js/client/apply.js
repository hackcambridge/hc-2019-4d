const $ = require('jquery');
const { createApplicationForm } = require('js/shared/application-form');
const { createTeamForm } = require('js/shared/team-form');

/**
 * jQuery's .serializeArray does not give us file input values. While we can't get useful
 * information about files' content easily, we can get its name for validation easily.
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
      location: '',
    };
  } else {
    return $field.val();
  }
}

function uncheckElements($fieldElements) {
  $fieldElements.each(function () {
    this.checked = false;
  });
}

/**
 * Determines if user input could lead to ambiguous data, and corrects it automatically
 * based on context - e.g. what the user most recently selected.
 */
function disallowAmbiguousAnswersProactively($form) {
  const notSureAnswer = 'unknown';

  const $developmentStyleFields = $form.find('input[name=development]');

  $developmentStyleFields.change(function () {
    const $field = $(this);
    
    if ($field.attr('value') === notSureAnswer) {
      uncheckElements($developmentStyleFields.not(`[value=${notSureAnswer}]`));
    } else {
      uncheckElements($developmentStyleFields.filter(`[value=${notSureAnswer}]`));
    }
  });

  const $teamFields = $form.find('input[name=team_apply], input[name=team_placement]');

  $teamFields.change(function () {
    uncheckElements($teamFields.not(this));
  });

  const $memberFields = $form.find('input[name=memberB], input[name=memberC], input[name=memberD]');

  $memberFields.on('input', function () {
    $(this).val($(this).val().replace(/\s/g, ''));
  });
}

function processForm($form, createForm) {
  disallowAmbiguousAnswersProactively($form);

  const supportsFileApi = ($('<input type="file">').get(0).files) !== undefined;

  const addFeedbackToForm = (form) => {
    let firstErrorFound = false;
    Object.keys(form.fields).forEach((fieldName) => {
      const $row = $form.find(`[name=${fieldName}]`).closest('.form-row');
      const field = form.fields[fieldName];

      $row.removeClass('error');
      $row.find('.error_msg').remove();

      if (field.error != null) {
        if (!firstErrorFound) {
          $('html, body').animate({
            scrollTop: $row.offset().top
          }, 500);
          firstErrorFound = true;
        }
        $row.find('.form-control-note').after(field.errorHTML());
        $row.addClass('error');
      }
    });
  };

  $form.submit((event, { valid } = { }) => {
    // Our form validation is asynchronous (but happens within a few ms).
    // This means that we have to re-submit the form after validation
    // with some kind of indicator that the validation has succeeded

    if (valid) {
      return true;
    }

    event.preventDefault();
    
    createForm(supportsFileApi).handle(
      serializeForm($form),
      {
        success: () => $form.trigger('submit', { valid: true }),
        error: addFeedbackToForm,
        empty: addFeedbackToForm,
      }
    );
  });
}

module.exports = function applyPage() {
  $('.apply-form').each(function () {
    processForm($(this), createApplicationForm);
  });
  $('.team-form').each(function () {
    processForm($(this), createTeamForm);
  });
};