import * as moment from 'moment';
import { Controller } from 'stimulus';

import * as dates from '../../shared/dates';

export default class ColorController extends Controller {
  /**
   * Colourable elements
   */
  public colorableTargets: HTMLElement[];

  static get targets() {
    return ['colorable'];
  }

  static get colorSequence() {
    return [{ color: '' },
            { time: dates.getHackingPeriodStart(), color: 'blue' },
            { time: dates.getHackingPeriodStart().add(8, 'hours'), color: 'black' },
            { time: dates.getHackingPeriodEnd().subtract(4, 'hours'), color: 'red' },
            { time: dates.getHackingPeriodEnd(), color: '' }];
  }

  public connect() {
    let key = 0;
    ColorController.colorSequence.slice(1).forEach(entry => {
      if (entry.hasOwnProperty('time') && (entry.time < moment())) {
        key++;
      }
    });
    this.setColorAndKey(key);
    setInterval(_ => this.checkTime(), 1000);
  }

  public checkTime() {
    let key = Number(this.data.get('key'));
    if (key < ColorController.colorSequence.length - 1) {
      const entry = ColorController.colorSequence[key + 1];
      if (entry.hasOwnProperty('time') && (entry.time < moment())) {
        key++;
        this.setColorAndKey(key);
      }
    }
  }

  public setColorAndKey(key) {
    this.colorableTargets.forEach(target => target.setAttribute('color', ColorController.colorSequence[key].color));
    this.data.set('key', key);
  }
}
