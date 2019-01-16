import { Controller } from 'stimulus';

import { UJSEvent } from '../ujs';

export default class EmailSignUpController extends Controller {
  /**
   * Field
   */
  public fieldTarget: HTMLInputElement;

  static get targets() {
    return ['field'];
  }

  public processResponse(event: UJSEvent<string>) {
    const [ response ] = event.detail;
    window.dispatchEvent(new CustomEvent('alert', { detail: response }));
  }

  public handleError(event: UJSEvent<string>) {
    const [ response, status ] = event.detail;
    if (status === 'Bad Request') {
      this.fieldTarget.setCustomValidity(response);
    } else {
      window.dispatchEvent(new CustomEvent('alert', { detail: `The server returned a ${status} error.\nThe error was: ${response}` }));
    }
  }
}
