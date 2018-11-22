import { Controller } from 'stimulus';

export default class ValidationMessagesController extends Controller {
  public allowMessage(_event) {
    if (!this.data.has('listening')) {
      this.data.set('listening', '');
    }
  }

  public scrollToElement(event) {
    if (this.data.has('listening')) {
      this.data.delete('listening');
      event.target.scrollIntoViewIfNeeded(true);
      this.reportValidity(event);
    }
  }

  public reportValidity(event) {
    event.target.reportValidity();
  }
}
