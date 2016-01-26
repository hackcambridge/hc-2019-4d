var $ = require('jquery');

module.exports = function () {
  $('.event-map-container')
    .click(() => $('.event-map').addClass('enabled'))
    .mouseleave(() => $('.event-map').removeClass('enabled'));
}
