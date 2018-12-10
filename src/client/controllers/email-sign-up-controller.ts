import { Controller } from 'stimulus';

export default class EmailSignUpController extends Controller {
  public processResponse(event) {
    const [data] = event.detail;
    alert(data.message);
  }

  public handleError(event) {
    const [data] = event.detail;
    alert(`An error occurred when submitting the form.\nThe error was: ${data.error}`);
  }
}
