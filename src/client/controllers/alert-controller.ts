import { Controller } from 'stimulus';

export default class AlertController extends Controller {
  /**
   * Dialog element, message, and dismiss button.
   */
  public dialogTarget: HTMLElement;
  public messageTarget: HTMLElement;

  static get targets() {
    return ['dialog', 'message', 'dismissButton'];
  }

  public connect() {
    if (this.data.has('message')) {
      this.showDialog();
    }
    window.alert = (message: string) => {
      this.data.set('message', message);
      this.showDialog();
    };
  }

  public showDialog() {
    this.messageTarget.innerText = this.data.get('message');
    this.dialogTarget.setAttribute('open', '');
  }

  public dismissDialog() {
    this.dialogTarget.removeAttribute('open');
  }
}
