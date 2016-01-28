'use strict';

var moment = require('moment');

class Countdown {
  constructor(options) {
    options = options || { };
    this.difference = null;
    this.deadlineTime = null;
    this.renderFunc = options.render || null;
    this.nextCountdown = options.next || null;
    this.precision = options.precision || 100;
    this.onCount = options.onCount || (() => undefined);
    this.timer = null;

    if (options.deadline) {
      this.deadline = options.deadline;
    }
  }

  set deadline(date) {
    this.deadlineTime = date.getTime();
    this.updateTime();
  }

  updateTime() {
    if (this.deadlineTime == null) {
      throw new Error('Must first set deadline before updating');
    }

    var now = new Date();
    var nowTime = now.getTime();

    this.difference = moment.duration(this.deadlineTime - nowTime);

    // Check for countdown chaining
    if ((this.nextCountdown) && (this.done)) {
      this.deadlineTime = this.nextCountdown.deadlineTime;
      this.renderFunc = this.nextCountdown.renderFunc;
      this.nextCountdown = this.nextCountdown.nextCountdown;
      this.updateTime();
    }
  }

  start() {
    this.timer = setInterval(this._onCount.bind(this), this.precision);
  }

  stop() {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  _onCount() {
    this.onCount(this.render());
  }

  render() {
    this.updateTime();
    return this.renderFunc ? this.renderFunc(this.difference) : this.difference.humanize();
  }

  get done() {
    return this.difference.asMilliseconds() < 0;
  }
}

function padZero(num) {
  if (num < 10) {
    return `0${num}`;
  }

  return `${num}`;
}

function titleCase(str) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
}

// Countdown.hackathonStart = new Date(Date.UTC(2016, 0, 30, 12, 0, 0));
Countdown.hackathonStart = new Date(Date.UTC(2016, 0, 29, 12, 0, 0));
Countdown.hackathonEnd = new Date(Date.UTC(2016, 0, 31, 12, 0, 0));

/**
 * Predefined Countdowns
 */
Countdown.createStartCountdown = () => new Countdown({
  deadline: Countdown.hackathonStart,
  render: (difference) => {
    if (difference.asHours() >= 1) {
      return titleCase('Starting In ' + difference.humanize()
        // HACK: Replace moment's humanised dates with more numerical ones
        .replace('an hour', '1 hour')
        .replace('a day', '1 day'));
    }

    var minutes = difference.minutes();
    var seconds = difference.seconds();
    var deciSeconds = Math.floor(difference.milliseconds() / 100);

    return `Starting in ${padZero(minutes)}:${padZero(seconds)}:${deciSeconds}`
  }
});

Countdown.createHackingCountdown = () => new Countdown({
  deadline: Countdown.hackathonEnd,
  render: (difference) => {
    if (difference.asMilliseconds() < 0) {
      return '00:00:00';
    }

    var hours = Math.floor(difference.asHours());
    var minutes = difference.minutes();
    var seconds = difference.seconds();

    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  }
});

Countdown.createChainedCountdown = () => {
  var c = Countdown.createStartCountdown();
  c.nextCountdown = Countdown.createHackingCountdown();
  return c;
};

module.exports = Countdown;
