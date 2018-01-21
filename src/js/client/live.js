function generateFeedItem(status) {
  const $socialItem = $('<div class="live-social-feed-item unit row"><div class="live-social-feed-item-content unit column grows"><div class="five unit row social-image-container"><div class="unit column grows social-image"></div></div></div></div>');
  const $socialTitle = $('<h6></h6>');
  $socialTitle.html(status.username);
  const $socialContent = $('<p></p>');
  const statusText = status.text.split(' ').slice(0, -1).join(' ');
  $socialContent.html(statusText);
  $socialItem.find('.live-social-feed-item-content').append($socialTitle).append($socialContent);
  if (status.image) {
    $socialItem.find('.social-image').css('background-image', `url(${status.image})`).css('background-size', 'cover');
  }
  if (! status.image) {
    $socialItem.find('.social-image-container').css('display', 'none');
  }
  return $socialItem;
}

function cycleFeedItems(statuses, element) {
  let i = 0;
  $(element).append(generateFeedItem(statuses[i]));
  i++;
  setInterval(() => {
    $(element).children().remove();
    $(element).append(generateFeedItem(statuses[i]));
    if (i == statuses.length - 1) {
      i = 0;
    } else {
      i++;
    }
  }, 30000);
}

const Countdown = require('../shared/countdown');

const Pusher = require('pusher-js');
const $ = require('jquery');
const moment = require('moment');

function eventNameList(events) {
  return events.map(event => `${event.name}`).join(' ');
}

function refreshEventInfo() {
  $.getJSON('/live-api/event-info', eventInfo => {
    const currentEvents = eventInfo.currentEvents;
    const nextEvents = eventInfo.nextEvents;

    if (currentEvents.length > 0) {
      $('.live-event-now-time').html(`${moment(currentEvents[0].time).format('HH:mm')}`);
      $('.live-event-now-text').html(`${eventNameList(currentEvents)}`);
    }

    if (nextEvents.length > 0) {
      $('.live-event-next-time').html(`${moment(nextEvents[0].time).format('HH:mm')}`);
      $('.live-event-next-text').html(`${eventNameList(nextEvents)}`);
    }
  });
}

function setBackground() {
  let time = new Date();
  if (time.getHours() > 18 || time.getHours() < 6) {
    if (! $('main').hasClass('black')) {
      $('main').addClass('black');
    }
  }
}

module.exports = () => {
  if (window.liveConfig) {
    initialiseLive();
  }
};

function initialiseLive() {
  const pusher = new Pusher(window.liveConfig.pusherKey, {
    encrypted: true,
    cluster: 'eu',
  });

  refreshEventInfo();
  window.setInterval(refreshEventInfo, 10000);

  const liveUpdates = pusher.subscribe('live-updates');
  let lastStatusId = null;

  $('.live-social-feed-content').each(() => {
    liveUpdates.bind('social', data => {
      if (data.statuses[0].id_str !== lastStatusId) {
        lastStatusId = data.statuses[0].id_str;
        const statuses = data.statuses;
        cycleFeedItems(statuses, '.live-social-feed-content');
      }
    });
  });
  
  function rotateCube() {
    const x = Math.random() * 360;
    const y = Math.random() * 360;
    const z = Math.random() * 360;
    $('#cube-logo').css('transform', 'rotateX(' + x + 'deg) rotateY(' + y + 'deg) rotateZ(' + z + 'deg)');
  }
  
  $('main').each(() => {
    setBackground();
    setInterval(() => {
      setBackground();
    }, 1800000);
  });
  
  $('.event-countdown').each(function () {
    let countdown = Countdown.createChainedCountdown();
    countdown.onCount = (rendered) => $(this).html(rendered);
    countdown.start();
  });
  
  $('#cube-logo').each(setInterval(rotateCube, 5000));
}
