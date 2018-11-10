import { Controller } from 'stimulus'

export default class extends Controller {
  static get targets() {
    return ['field']
  }
  
  connect() {
    if (this.data.has('error')) {
      this.fieldTargets.forEach(element => {
        element.setCustomValidity(this.data.get('error'))
      })
    }
  }
  
  setValid(event) {
    this.fieldTargets.forEach(element => {
      element.setCustomValidity('')
    })
    this.data.delete('error')
  }
}
