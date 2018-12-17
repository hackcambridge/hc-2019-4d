export interface UJSEvent<Data> extends Event {
  detail: [Data, string, XMLHttpRequest];
}
