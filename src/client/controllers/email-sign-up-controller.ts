import { Controller } from 'stimulus';
import { UJSEvent } from '../main';

export default class EmailSignUpController extends Controller {
  public processResponse(event: UJSEvent<any>) {
    const [data] = event.detail;
    alert(data);
  }

  public handleError(event: UJSEvent<any>) {
    const [ response, status ] = event.detail;
    alert(`The server returned a ${status} error.\nThe error was: ${response}`);
    console.log(response);
  }
}
