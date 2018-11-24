import * as moment from 'moment';

function flatten(arr) {
  return [].concat.apply([], arr);
}

// Flattens schedule into one long list of {time, name} objects
function getSortedIndividualEvents(schedule) {
  return flatten(schedule.map(item =>
    flatten(item.entries.map(entry =>
      flatten(entry.events.map(event =>
        [{ time: entry.time, name: event.name }].concat(event.subevents ?
          event.subevents.map(subevent => ({ time: subevent.time, name: subevent.name })) : [])
      ))
    ))
  ));
}

export function getCurrentEvents(schedule) {
  const individualEvents = getSortedIndividualEvents(schedule);

  const now = moment();
  const previousAndCurrentEvents = individualEvents.filter(event =>
    event.time.isBefore(now));

  if (previousAndCurrentEvents.length === 0) {
    return [];
  }

  const currentEventTime = previousAndCurrentEvents[previousAndCurrentEvents.length - 1].time;

  // Get all the events occuring at this time — there may be multiple concurrent events
  return previousAndCurrentEvents.filter(event => event.time.isSame(currentEventTime));
}

export function getNextEvents(schedule) {
  const individualEvents = getSortedIndividualEvents(schedule);

  const now = moment();
  const futureEvents = individualEvents.filter(event =>
    event.time.isAfter(now));

  if (futureEvents.length === 0) {
    return [];
  }

  const nextEventTime = futureEvents[0].time;

  // Get all the events occuring at this time — there may be multiple concurrent events
  return futureEvents.filter(event => event.time.isSame(nextEventTime));
}
