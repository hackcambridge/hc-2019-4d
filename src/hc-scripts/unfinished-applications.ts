import { getCsvOfHackersWithUnfinishedApplications, UnfinishedApplicationKind } from 'server/apply/applicant-info';
import { createHandler } from './utils';

export default {
  command: 'unfinished-applications <kind>',
  desc: 'Get details of all hackers who started an application but didn\'t finish it',
  aliases: [],
  builder(yargs) {
    return yargs
      .example('unfinished-applications individual',
        'Get details of hackers who didn\'t finish their individual application')
      .example('unfinished-applications team-only',
        'Get details of hackers who finished their individual application but not their team application');
  },
  handler: createHandler(async ({ kind }) => {
    console.assert(kind === UnfinishedApplicationKind.INDIVIDUAL || kind === UnfinishedApplicationKind.TEAM_ONLY);
    console.log(await getCsvOfHackersWithUnfinishedApplications(kind));
  }),
};
