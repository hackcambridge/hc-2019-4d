function setFeedItem(status) {
  $('.social-title').html(status.username);
  const statusText = status.text.split(' ').slice(0, -1).join(' ');
  $('.social-content').html(statusText);
  if (status.image) {
    if (! $('.social-image-inner-container').hasClass('five')) {
      $('.social-image-inner-container').addClass('five');
    }
    if (! $('.social-image-outer-container').hasClass('five')) {
      $('.social-image-outer-container').addClass('five');
    }
    if (! $('.social-image-outer-container').hasClass('half')) {
      $('.social-image-outer-container').addClass('half');
    }
    $('.social-image').css('background-image', `url(${status.image})`).css('background-size', 'cover');
  } else {
    if ($('.social-image-inner-container').hasClass('five')) {
      $('.social-image-inner-container').removeClass('five');
    }
    if ($('.social-image-outer-container').hasClass('five')) {
      $('.social-image-outer-container').removeClass('five');
    }
    if ($('.social-image-outer-container').hasClass('half')) {
      $('.social-image-outer-container').removeClass('half');
    }
  }
}

function cycleFeedItems(statuses, element) {
  let i = 0;
  setFeedItem(statuses[i]);
  i++;
  setInterval(() => {
    setFeedItem(statuses[i]);
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
  return events.map(event => `<h4>${event.name}</h4>`).join(' ');
}

let previousEventInfo = null;

function refreshEventInfo() {
  $.getJSON('/live-api/event-info', newEventInfo => {
    if (JSON.stringify(newEventInfo) != JSON.stringify(previousEventInfo)) {
      const currentEvents = newEventInfo.currentEvents;
      const nextEvents = newEventInfo.nextEvents;
      if (currentEvents.length > 0) {
        $('.live-event-now-time').html(`${moment(currentEvents[0].time).format('HH:mm')}`);
        $('.live-event-now-text-container').html(`${eventNameList(currentEvents)}`);
      }
      if (nextEvents.length > 0) {
        $('.live-event-next-time').html(`${moment(nextEvents[0].time).format('HH:mm')}`);
        $('.live-event-next-text-container').html(`${eventNameList(nextEvents)}`);
      }
      previousEventInfo = newEventInfo;
    }
  });
}

function setBackground() {
  let time = new Date();
  if (time.getHours() > 18 || time.getHours() < 8) {
    if (! $('main').hasClass('black')) {
      $('main').addClass('black');
    }
  } else if (time.getDate() == '21' && time.getHours() >= 12) {
    if (! $('main').hasClass('red')) {
      $('main').addClass('red');
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
  setInterval(() => {
    refreshEventInfo();
  ;
  }, 10000);
  
  setBackground();
  setInterval(setBackground, 300000);

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
  
  $('.event-countdown').each(function () {
    let countdown = Countdown.createChainedCountdown();
    countdown.onCount = (rendered) => $(this).html(rendered);
    countdown.start();
  });
  
  $('#cube-logo').each(setInterval(rotateCube, 5000));
}
