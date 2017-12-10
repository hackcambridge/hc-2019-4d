let $ = require('jquery');

require('./polyfills');

let Countdown = require('../shared/countdown');

let pages = [
  require('./payment'),
  require('./apply'),
  require('./fractal'),
  require('./live'),
];

$(document).ready(() => {
  pages.forEach((f) => f());

  $('.signup-form').each((index, element) => {
    const $this = $(element);
    const action = $this.attr('action');
    const method = $this.attr('method');
    const $submit = $this.find('input[type="submit"]');
    const submitText = $submit.text();
    let loading = null;

    const createFlash = (text, className) => {
      return $('<p class="signup-form-output"></p>')
        .text(text)
        .addClass(className)
        .insertAfter($this)
        .hide()
        .slideDown();
    };

    $this.submit((e) => {
      e.preventDefault();

      $('.signup-form-output')
        .slideUp(400, function () {
          $(this).remove();
        });

      if ($this.find('input[type="email"]').val().trim() === '') {
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
        method: method,
        data: $this.serialize()
      }).done((data) => {
        createFlash(data.message, 'signup-form-success');
      }).fail((jqXHR) => {
        const errormsg = ((jqXHR.responseJSON) && (jqXHR.responseJSON.error)) ? jqXHR.responseJSON.error : 'Something went wrong. Please try again.';

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

  $('.landing-welcome-lower-caret').each(function () {
    // Remove the link as this isn't operating as a link anymore
    $(this).find('a').children().appendTo($(this));
    $(this).find('a').remove();

    $(this).click(() => {
      $('body, html').animate({ scrollTop: $('.landing-intro-section').offset().top - 40 }, 1400);
    });
  });

  {
    let resize = true;
    $(window).scroll(() => {
      if (resize) {
        window.requestAnimationFrame(() => {
          const diamond = document.querySelector('.landing-welcome-background-box1');
          if (diamond !== null) {
            diamond.style.setProperty('--diamond-scale', `${1 + window.scrollY / 1000}`);
            resize = true;
          }
        });
        resize = false;
      }
    });
  }

  $('.event-countdown').each(function () {
    let countdown = Countdown.createChainedCountdown();

    countdown.onCount = (rendered) => $(this).html(rendered);
    countdown.start();
  });

  /*var updateCountdown = function () {
    $('.application-countdown').html(createCountdownText());
  };

  if ($('.application-countdown').length > 0) {
    setInterval(updateCountdown, 500);
    updateCountdown();
  }*/
});
