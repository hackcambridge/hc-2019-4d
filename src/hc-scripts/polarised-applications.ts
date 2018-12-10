import * as util from 'util';

import { getCriterionScoreValues, getPolarisedApplications } from 'server/review/polarised';
import { createHandler } from './utils';

export default {
  command: 'polarised-applications <aboveStdev>',
  desc: 'Get applications whose reviews have a standard deviation above the input parameter',
  aliases: [],
  handler: createHandler(async ({ aboveStdev }) => {
    const applications = await getPolarisedApplications(aboveStdev);

    console.log(util.inspect(applications.map(app => ({
      id: app.id,
      reviewSets: app.reviewSets.map(getCriterionScoreValues),
      stdev: app.stdev
    })), undefined, 5));
  })
};
