import * as $ from 'jquery';

import { createApplicationForm } from 'js/shared/apply/application-form';
import { createTeamForm } from 'js/shared/apply/team-form';

export function start() {
  $('.apply-form').each((_, form: HTMLFormElement) => processForm($(form), createApplicationForm));
  $('.team-form').each((_, form: HTMLFormElement) => processForm($(form), createTeamForm));
}


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
  $fieldElements.each((_, element) => {
    element.checked = false;
  });
}

/**
 * Determines if user input could lead to ambiguous data, and corrects it automatically
 * based on context - e.g. what the user most recently selected.
 */
function disallowAmbiguousAnswersProactively($form: JQuery<HTMLFormElement>) {
  const notSureAnswer = 'unknown';

  const $developmentStyleFields = $form.find('input[name=development]');

  $developmentStyleFields.change(e => {
    const $field = $(e.target);
    
    if ($field.attr('value') === notSureAnswer) {
      uncheckElements($developmentStyleFields.not(`[value=${notSureAnswer}]`));
    } else {
      uncheckElements($developmentStyleFields.filter(`[value=${notSureAnswer}]`));
    }
  });

  const $teamFields = $form.find('input[id=id_team_team_apply], input[id=id_team_team_placement]');

  $teamFields.change(e => uncheckElements($teamFields.not(e.target)));

  const $memberFields = $form.find('input[name=memberB], input[name=memberC], input[name=memberD]');

  $memberFields.on('input', e =>
    $(e.target).val((<string>$(e.target).val()).replace(/\s/g, '')));
}

function processForm($form: JQuery<HTMLFormElement>, createForm) {
  disallowAmbiguousAnswersProactively($form);

  const supportsFileApi = (<HTMLInputElement>$('<input type="file">').get(0)).files !== undefined;

  const addFeedbackToForm = (form) => {
    let firstErrorFound = false;
    Object.keys(form.fields).forEach((fieldName) => {
      const $row = $form.find(`[name=${fieldName}]`).closest('.form-row');
      const field = form.fields[fieldName];

      $row.removeClass('error');
      $row.find('.error').html('');

      if (field.error != null) {
        if (!firstErrorFound) {
          $('html, body').animate({
            scrollTop: $row.offset().top
          }, 500);
          firstErrorFound = true;
        }
        if ($row.find('.r').length) {
          $row.find('.form-control-note').after(field.errorHTML());
        } else {
          $row.find('.error').html(field.errorHTML());
        }
        
        $row.addClass('error');
      }
    });
  };

  $form.submit((event, { valid } = { valid: false }) => {
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
