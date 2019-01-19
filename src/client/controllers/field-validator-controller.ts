import { Controller } from 'stimulus';

export default class FieldValidatorController extends Controller {
  /**
   * Form fields
   */
  public fieldTargets: HTMLInputElement[];

  static get targets() {
    return ['field'];
  }

  public connect() {
    if (this.data.has('error')) {
      this.fieldTargets.forEach(element => {
        element.setCustomValidity(this.data.get('error'));
      });
    }
  }

  public setValid(_event) {
    this.fieldTargets.forEach(element => {
      element.setCustomValidity('');
    });
    this.data.delete('error');
  }
}
