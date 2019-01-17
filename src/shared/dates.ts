import * as moment from 'moment';

export function getApplicationsStart(): moment.Moment {
  return moment('2018-11-10T23:30:00Z');
}

/**
 * Links to start applications will be removed from this date.
 */
export function getApplicationsEnd(): moment.Moment {
  return moment('2018-12-17T23:59:00Z');
}

export function getHackathonStartDate(): moment.Moment {
  return moment('2019-01-19T09:00:00Z');
}

export function getHackathonEndDate(): moment.Moment {
  return moment('2019-01-20T18:00:00Z');
}

export function getFridayBeforeHackathonDate(): moment.Moment {
  const fridayWeekday = 5;
  return getHackathonStartDate().isoWeekday() > fridayWeekday
    ? getHackathonStartDate().isoWeekday(fridayWeekday)
    : getHackathonStartDate().subtract(1, 'week').isoWeekday(fridayWeekday);
}

/**
 * Returns the datetime applications are advertised to close. This is the closing date
 * displayed to hackers. Applications won't actually close until `getApplicationsEnd`, at
 * which point links to start applications will be removed.
 */
export function getAdvertisedApplicationsEnd(): moment.Moment {
  return moment('2018-12-17T23:59:59Z');
}

/**
 * Returns the earliest graduation date we can accept.
 *
 * This is due to the restriction imposed by MLH that attendees must either be students or
 * graduates who have graduated within the 12 months prior to the event.
 * https://mlh.io/faq#i-just-graduated-can-i-still-come-to-an-event
 */
export function getEarliestGraduationDateToAccept(): moment.Moment {
  return getHackathonStartDate().subtract(1, 'year');
}

/**
 * Returns the datetime at which the hacking period begins.
 */
export function getHackingPeriodStart(): moment.Moment {
  return moment('2019-01-19T12:00:00Z');
}

/**
 * Returns the datetime at which the hacking period ends.
 */
export function getHackingPeriodEnd(): moment.Moment {
  return moment('2019-01-20T12:00:00Z');
}
