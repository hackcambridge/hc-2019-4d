import { getPolarisedApplications } from 'server/review/polarised';
import { createHandler } from './utils';

export default {
  command: 'polarised-applications <aboveStdev>',
  desc: 'Get applications whose reviews have a standard deviation above the input parameter',
  aliases: [],
  handler: createHandler(async ({ aboveStdev }: { aboveStdev: number }) => {
    const applications = await getPolarisedApplications(aboveStdev);

    console.log(applications.map(app => ({
      id: app.id,
      rating: app.rating,
      ratingStdev: app.ratingStdev
    })));
  })
};
