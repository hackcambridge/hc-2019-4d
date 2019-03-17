import { Controller } from 'stimulus';

import { Countdown } from '../../shared/countdown';

export default class CountdownController extends Controller {
  /**
   * Countdown element
   */
  public timeTarget: HTMLElement;

  static get targets() {
    return ['time'];
  }

  public connect() {
    const countdown = Countdown.createChainedCountdown();
    countdown.onCount = rendered => this.timeTarget.innerText = rendered;
    countdown.start();
  }
}
