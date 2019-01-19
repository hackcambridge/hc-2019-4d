import * as $ from 'jquery';

import { Countdown } from 'shared/countdown';

export function start() {
  initialiseLive();
}

function initialiseLive() {
  $('.event-countdown').each(function() {
    const countdown = Countdown.createChainedCountdown();
    countdown.onCount = rendered => $(this).html(rendered);
    countdown.start();
  });
}
