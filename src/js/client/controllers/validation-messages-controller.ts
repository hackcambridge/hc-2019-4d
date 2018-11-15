import { Controller } from 'stimulus'

export default class ValidationMessagesController extends Controller {
  allowMessage(event) {
    if (!this.data.has('listening')) {
      this.data.set('listening', '')
    }
  }
  
  scrollToElement(event) {
    if (this.data.has('listening')) {
      this.data.delete('listening')
      event.target.scrollIntoViewIfNeeded(true)
      this.reportValidity(event)
    }
  }
  
  reportValidity(event) {
    event.target.reportValidity()
  }
}
