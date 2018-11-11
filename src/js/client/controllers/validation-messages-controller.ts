import { Controller } from 'stimulus'

export default class ValidationMessagesController extends Controller {
  allowMessage(event) {
    if (!(this.data.has('listening'))) {
      this.data.set('listening', '')
    }
  }
  
  scrollToElement(event) {
    if (this.data.has('listening')) {
      this.data.delete('listening')
      event.target.scrollIntoViewIfNeeded(true)
      event.target.reportValidity()
    }
  }
  
  reportValidity(event) {
    event.target.reportValidity()
  }
}
