var $ = require('jquery');
var Countdown = require('lib/countdown');
var url = require('url');

module.exports = function () {
  $('.event-map-container')
    .click(() => $('.event-map').addClass('enabled'))
    .mouseleave(() => $('.event-map').removeClass('enabled'));

  $('.event-countdown').each(function () {
    var countdown = Countdown.createChainedCountdown();

    countdown.onCount = (rendered) => $(this).html(rendered);
    countdown.start();
  });

  if ($('.event-nav').length != 0) {
    // If there is an event nav on the page
    // We can go into event navigation mode for smooth scrolling everywhere

    $('body').on('click', 'a', function (e) {
      var href = $(this).attr('href');
      // Currently only hrefs with a hash as their first character will work
      if (href[0] == '#') {
        var $target = $(href);
        if ($target.length != 0) {
          var top = $target.offset().top;
          $('body, html').animate({ scrollTop: top});
          e.preventDefault();
        }
      }
    });
  }
}
