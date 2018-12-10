import { Controller } from 'stimulus';
import { UJSEvent } from '../main';

export default class EmailSignUpController extends Controller {
  public processResponse(event: UJSEvent<any>) {
    const [data] = event.detail;
    alert(data.message);
  }

  public handleError(event: UJSEvent<any>) {
    const [data] = event.detail;
    alert(`An error occurred when submitting the form.\nThe error was: ${data.error}`);
  }
}
