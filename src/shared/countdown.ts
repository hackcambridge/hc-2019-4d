import * as moment from 'moment';
import 'moment-duration-format';

interface FormattableDuration extends moment.Duration {
  format(template: string, options?: object): string;
}

import * as dates from './dates';

export class Countdown {

  set deadline(date: Date) {
    this.deadlineTime = moment(date);
    this.updateTime();
  }

  get done(): boolean {
    return this.difference.asMilliseconds() < 0;
  }

  /**
   * Predefined Countdowns
   */
  public static createCountdown(time) {
    return new Countdown(time, difference => `−${difference.format(Countdown.countdownFormat, { trim: false })}`);
  }

  public static createEndpoint(time) {
    return new Countdown(time, difference => {
        if (moment() < time) {
          return `−${difference.format(Countdown.countdownFormat, { trim: false })}`;
        } else {
          return (moment.duration(0) as FormattableDuration).format(Countdown.countdownFormat, { trim: false });
        }
      }
    );
  }

  public static createChainedCountdown() {
    const c = Countdown.createCountdown(Countdown.hackathonStart);
    c.nextCountdown = Countdown.createEndpoint(Countdown.hackathonEnd);
    return c;
  }

  private static hackathonStart: Date = dates.getHackingPeriodStart().toDate();
  private static hackathonEnd: Date = dates.getHackingPeriodEnd().toDate();
  private static countdownFormat: string = 'hh:mm:ss';

  public onCount: (renderedText: string) => void;

  private difference: FormattableDuration;
  private deadlineTime: moment.Moment;
  private nextCountdown: Countdown;
  private renderFunc: (difference: FormattableDuration) => string;
  private timer: number;
  constructor(deadline, renderFunction) {
    this.difference = null;
    this.deadlineTime = null;
    this.renderFunc = renderFunction;
    this.nextCountdown = null;
    this.onCount = (() => undefined);
    this.timer = null;

    if (deadline) {
      this.deadline = deadline;
    }
  }

  public updateTime() {
    if (this.deadlineTime == null) {
      throw new Error('Must first set deadline before updating');
    }

    this.difference = moment.duration(this.deadlineTime.diff(moment())) as FormattableDuration;

    // Check for countdown chaining
    if ((this.nextCountdown) && (this.deadlineTime < moment())) {
      this.deadlineTime = this.nextCountdown.deadlineTime;
      this.renderFunc = this.nextCountdown.renderFunc;
      this.nextCountdown = this.nextCountdown.nextCountdown;
      this.updateTime();
    }
  }

  public start() {
    this.timer = window.setInterval(() => this.onCount(this.render()), 1000);
  }

  public stop() {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public render(): string {
    this.updateTime();
    return this.renderFunc(this.difference);
  }
}
