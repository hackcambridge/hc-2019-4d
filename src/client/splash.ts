import * as $ from 'jquery';

// Add globals for Facebook and Google Analytics
declare global {
  interface Window {
    fbq: any;
    ga: any;
  }
}

export function start() {
  $('.signup-form').each((_index, element) => {
    const $element = $(element);
    const action = $element.attr('action');
    const method = $element.attr('method');
    const $submit = $element.find('input[type="submit"]');
    const submitText = $submit.text();
    let loading = null;

    const createFlash = (text, className) => {
      return $('<p class="signup-form-output"></p>')
        .text(text)
        .addClass(className)
        .insertAfter($element)
        .hide()
        .slideDown();
    };

    $element.submit(e => {
      e.preventDefault();

      $('.signup-form-output')
        .slideUp(400, function() {
          $(this).remove();
        });

      if (($element.find('input[type="email"]').val() as string).trim() === '') {
        createFlash('Must provide email', 'signup-form-error');
        return;
      }

      if (loading != null) {
        return;
      }

      $submit
        .prop('disabled', true)
        .text('Working...');

      loading = $.ajax(action, {
        method,
        data: $element.serialize()
      }).done(data => {
        createFlash(data.message, 'signup-form-success');
      }).fail(jqXHR => {
        const errormsg = ((jqXHR.responseJSON) && (jqXHR.responseJSON.error)) ?
          jqXHR.responseJSON.error :
          'Something went wrong. Please try again.';

        createFlash(errormsg, 'signup-form-error');
      }).always(() => {
        $submit
          .text(submitText);

        setTimeout(() => {
          loading = null;
          $submit.prop('disabled', false);
        }, 3000);
      });

      window.ga('send', 'event', 'Subscription', 'subscribed');
      window.fbq('track', 'CompleteRegistration');
    });
  });
}
