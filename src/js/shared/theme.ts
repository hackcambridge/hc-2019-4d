import { loadResource } from "../server/utils";


export function getEventName() {
  return loadResource('event').theme.name;
}