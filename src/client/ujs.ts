import * as UJS from '@rails/ujs';

function customConfirm(message: string, element: HTMLElement) {
  window.dispatchEvent(new CustomEvent('confirm:show', { detail: message }));
  window.addEventListener('confirm:confirmed', _ => {
    UJS.confirm = () => true;
    element.dispatchEvent(new Event('click'));
    UJS.confirm = customConfirm;
  });
  window.addEventListener('confirm:cancelled', _ => false);
  return false;
}

UJS.confirm = (message: string, element: HTMLElement) => customConfirm(message, element);

export { UJS };

export interface UJSEvent<Data> extends Event {
  detail: [Data, string, XMLHttpRequest];
}
