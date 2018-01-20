const Countdown = require('../shared/countdown');

const Pusher = require('pusher-js');
const $ = require('jquery');
const moment = require('moment');

function eventNameList(events) {
  return '<ul> ' + events.map(event => `<li>${event.name}</li>`).join(' ') + ' </ul>';
}

function refreshEventInfo() {
  $.getJSON('/live-api/event-info', eventInfo => {
    const currentEvents = eventInfo.currentEvents;
    const nextEvents = eventInfo.nextEvents;

    if (currentEvents.length > 0) {
      $('.live-event-now').html(`${moment(currentEvents[0].time).format('HH:mm')} ${eventNameList(currentEvents)}`);
    }

    if (nextEvents.length > 0) {
      $('.live-event-next').html(`${moment(nextEvents[0].time).format('HH:mm')} ${eventNameList(nextEvents)}`);
    }
  });
}

function initialiseLive() {
  const pusher = new Pusher(window.liveConfig.pusherKey, {
    encrypted: true,
    cluster: 'eu',
  });

  refreshEventInfo();
  window.setInterval(refreshEventInfo, 10000);

  const liveUpdates = pusher.subscribe('live-updates');

  $('.live-social-feed-content').each(function () {
    liveUpdates.bind('social', (data) => {
      $(this).children('.live-social-feed-item-twitter').remove();
      $(this).append(data.statuses.slice(0, 4).map(status => {
        const $socialItem = $('<div class="live-social-feed-item live-social-feed-item-twitter"><div class="live-social-feed-item-content"></div></div>');
        const $socialTitle = $('<h4></h4>');
        $socialTitle.text(status.username);
        const $socialContent = $('<p></p>');
        $socialContent.html(status.text);
        $socialItem.find('.live-social-feed-item-content').append($socialTitle).append($socialContent);
        if (status.image) {
          $socialItem.find('.live-social-feed-item-content').css('background-image', `linear-gradient(to top, rgba(0, 0, 0, 0.6) 0, rgba(0, 0, 0, 0.2) 200px, rgba(0, 0, 0, 0)), url(${status.image})`);
        }
        
        return $socialItem;
      }));
    });
  });

  $('.event-countdown').each(function () {
    let countdown = Countdown.createChainedCountdown();

    countdown.onCount = (rendered) => $(this).html(rendered);
    countdown.start();
  });
}

module.exports = () => {
  if (window.liveConfig) {
    initialiseLive();
  }
};
