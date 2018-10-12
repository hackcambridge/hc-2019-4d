import * as moment from 'moment';

export function getHackathonStartDate() {
  return moment('2019-01-19');
}

export function getHackathonEndDate() {
  return getHackathonStartDate().add(1, 'day');
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
  return moment('2019-01-19T12:00:00Z');
}

/**
 * Returns the datetime at which the hacking period ends.
 */
export function getHackingPeriodEnd() {
  return moment('2019-01-20T12:00:00Z');
}

/**
 * Returns the datetime when applications close.
 */
export function getApplicationsCloseDate() {
  return moment('2019-12-01T00:00:00Z');
}
