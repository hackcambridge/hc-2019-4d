import * as $ from 'jquery';
import * as Pusher from 'pusher-js';

import { Countdown } from 'shared/countdown';

// Add globals for Pusher config
declare global {
  interface Window {
    liveConfig: any;
  }
}

export function start() {
  if (window.liveConfig) {
    initialiseLive();
  }
}

function setFeedItem(status) {
  $('.social-title').html(status.username);
  const statusText = status.text.split(' ').slice(0, -1).join(' ');
  $('.social-content').html(statusText);
  if (status.image) {
    $('.social-image').attr('src', status.image);
  }
}

function cycleFeedItems(statuses) {
  let i = 0;
  setFeedItem(statuses[i]);
  i++;
  setInterval(() => {
    setFeedItem(statuses[i]);
    if (i === statuses.length - 1) {
      i = 0;
    } else {
      i++;
    }
  }, 30000);
}

function initialiseLive() {
  const pusher = new Pusher(window.liveConfig.pusherKey, {
    encrypted: true,
    cluster: 'eu',
  });

  const liveUpdates = pusher.subscribe('live-updates');
  let lastStatusId = null;
  $('.live-social-feed-content').each(() => {
    liveUpdates.bind('social', data => {
      if (data.statuses[0].id_str !== lastStatusId) {
        lastStatusId = data.statuses[0].id_str;
        const statuses = data.statuses;
        cycleFeedItems(statuses);
      }
    });
  });

  $('.event-countdown').each(function() {
    const countdown = Countdown.createChainedCountdown();
    countdown.onCount = rendered => $(this).html(rendered);
    countdown.start();
  });
}
