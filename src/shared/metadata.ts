import { getHackathonEndDate, getHackathonStartDate } from './dates';

function createDescription() {
  if (!getHackathonStartDate().isSame(getHackathonEndDate(), 'month')) {
    throw new Error('Hackathon start and end dates must be in the same month to create description');
  }

  const formattedDateRange = getHackathonStartDate().format('MMMM D') + ' – ' + getHackathonEndDate().format('D');

  return `Join us for 24 hours of building, breaking and creating in the heart of Cambridge from ${formattedDateRange}.`;
}

export const description = createDescription();

export const title = 'Hack Cambridge';
export const eventTitle = 'Hack Cambridge 4D';
