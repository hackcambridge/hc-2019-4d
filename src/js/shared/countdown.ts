import * as dates from 'js/shared/dates';
import * as moment from 'moment';

export class Countdown {

  set deadline(date: Date) {
    this.deadlineTime = date.getTime();
    this.updateTime();
  }

  get done(): boolean {
    return this.difference.asMilliseconds() < 0;
  }

  /**
   * Predefined Countdowns
   */
  public static createStartCountdown() {
    return new Countdown({
      deadline: Countdown.hackathonStart,
      render:difference => {
        if (difference.asHours() >= 1) {
          return ('Starting in ' + difference.humanize()
            // HACK: Replace moment's humanised dates with more numerical ones
            .replace('an hour', '1 hour')
            .replace('a day', '1 day') + '…');
        }

        const minutes = difference.minutes();
        const seconds = difference.seconds();
        const deciSeconds = Math.floor(difference.milliseconds() / 100);

        return `Starting in ${padZero(minutes)}:${padZero(seconds)}:${deciSeconds}`;
      }
    });
  }

  public static createHackingCountdown() {
    return new Countdown({
      deadline: Countdown.hackathonEnd,
      render:difference => {
        if (difference.asMilliseconds() < 0) {
          return '00:00:00';
        }

        return [Math.floor(difference.asHours()), difference.minutes(), difference.seconds()]
          .map(t => padZero(t))
          .join(':');
      }
    });
  }

  public static createChainedCountdown() {
    const c = Countdown.createStartCountdown();
    c.nextCountdown = Countdown.createHackingCountdown();
    return c;
  }

  private static hackathonStart: Date = dates.getHackingPeriodStart().toDate();
  private static hackathonEnd: Date = dates.getHackingPeriodEnd().toDate();

  public onCount: (renderedText: string) => void;

  private difference: moment.Duration;
  private deadlineTime: number;
  private nextCountdown: Countdown;
  private renderFunc: (difference: moment.Duration) => string;
  private precision: number;
  private timer: number;
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

  public updateTime() {
    if (this.deadlineTime == null) {
      throw new Error('Must first set deadline before updating');
    }

    const now = new Date();
    const nowTime = now.getTime();

    this.difference = moment.duration(this.deadlineTime - nowTime);

    // Check for countdown chaining
    if ((this.nextCountdown) && (this.done)) {
      this.deadlineTime = this.nextCountdown.deadlineTime;
      this.renderFunc = this.nextCountdown.renderFunc;
      this.nextCountdown = this.nextCountdown.nextCountdown;
      this.updateTime();
    }
  }

  public start() {
    this.timer = window.setInterval(() => this.onCount(this.render()), this.precision);
  }

  public stop() {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public render(): string {
    this.updateTime();
    return this.renderFunc ? this.renderFunc(this.difference) : this.difference.humanize();
  }
}

function padZero(num) {
  const chars = `${num}`.split('');
  if (chars.length <= 1) {
    chars.unshift('0');
  }

  return chars.map(c => `${c}`).join('');
}
