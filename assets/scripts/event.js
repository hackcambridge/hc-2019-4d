var $ = require('jquery');
var Countdown = require('lib/countdown');

module.exports = function () {
  $('.event-map-container')
    .click(() => $('.event-map').addClass('enabled'))
    .mouseleave(() => $('.event-map').removeClass('enabled'));

  $('.event-countdown').each(function () {
    var countdown = Countdown.createChainedCountdown();

    countdown.onCount = (rendered) => $(this).html(rendered);
    countdown.start();
  });
}
