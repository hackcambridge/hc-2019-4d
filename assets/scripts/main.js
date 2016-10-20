var $ = require('jquery');
var Countdown = require('lib/countdown.js');

require('./polyfills')

var pages = [
  require('./payment'),
];

$(document).ready(function () {
  pages.forEach((f) => f());

  $('.subscribe-form').each((index, element) => {
    const $this = $(element);
    const action = $this.attr('action');
    const method = $this.attr('method');
    const $submit = $this.find('.subscribe-form-submit');
    const submitText = $submit.text();
    let loading = null;

    const createFlash = (text, className) => {
      return $('<p class="subscribe-form-output"></p>')
        .text(text)
        .addClass(className)
        .appendTo($this)
        .hide()
        .slideDown();
    };

    $this.submit(function (e) {
      e.preventDefault();

      if (loading != null) {
        return;
      }

      $submit
        .prop('disabled', true)
        .text('Working...');

      $this.find('.subscribe-form-output')
        .slideUp(400, function () {
          $(this).remove();
        });

      loading = $.ajax(action, {
        method: method,
        data: $this.serialize()
      }).success((data) => {
        createFlash(data.message, 'subscribe-form-success');
      }).fail((jqXHR) => {
        const errormsg = ((jqXHR.responseJSON) && (jqXHR.responseJSON.error)) ? jqXHR.responseJSON.error : 'Something went wrong. Please try again.';

        createFlash(errormsg, 'subscribe-form-error');
      }).always(() => {
        $submit
          .text(submitText);

        setTimeout(() => {
          loading = null;
          $submit.prop('disabled', false);
        }, 3000)
      });

      ga('send', 'event', 'Subscription', 'subscribed');
      fbq('track', 'CompleteRegistration');
    });
  });

  $('.landing-welcome-lower-caret').each(function () {
    // Remove the link as this isn't operating as a link anymore
    $(this).find('a').children().appendTo($(this));
    $(this).find('a').remove();

    $(this).click(function () {
      $('body, html').animate({ scrollTop: $('.landing-intro-section').offset().top - 40 }, 1400);
    });
  });

  /*var updateCountdown = function () {
    $('.application-countdown').html(createCountdownText());
  };

  if ($('.application-countdown').length > 0) {
    setInterval(updateCountdown, 500);
    updateCountdown();
  }*/
});
