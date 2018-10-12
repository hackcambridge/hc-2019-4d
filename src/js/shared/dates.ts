import * as moment from 'moment';
import { loadResource } from '../server/utils';

export function getHackathonStartDate(): moment.Moment {
  return moment(loadResource('event').dates.start);
}

export function getHackathonEndDate(): moment.Moment {
  return moment(loadResource('event').dates.end);
}

/**
 * Returns the earliest graduation date we can accept.
 *
 * This is due to the restriction imposed by MLH that attendees must either be students or
 * graduates who have graduated within the 12 months prior to the event.
 * https://mlh.io/faq#i-just-graduated-can-i-still-come-to-an-event
 */
export function getEarliestGraduationDateToAccept() {
  return getHackathonStartDate().subtract(1, 'year');
}

/**
 * Returns the datetime at which the hacking period begins.
 */
export function getHackingPeriodStart() {
  return moment(loadResource('event').dates.hackingStart);
}

/**
 * Returns the datetime at which the hacking period ends.
 */
export function getHackingPeriodEnd() {
  return moment(loadResource('event').dates.hackingEnd);
}

/**
 * Returns the datetime when applications close.
 */
export function getApplicationsCloseDate() {
  return moment(loadResource('event').dates.applicationsClose);
}
