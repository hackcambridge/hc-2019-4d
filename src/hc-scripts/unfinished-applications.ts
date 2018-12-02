import * as stringify from 'csv-stringify/lib/sync';

import { getHackersWithUnfinishedApplications } from 'server/apply/applicant-info';
import { HackerInstance } from 'server/models';
import { createHandler } from './utils';

function outputHackers(hackerList: ReadonlyArray<HackerInstance>): void {
  const columns = {
    email: 'Email',
    firstName: 'First name',
    lastName: 'Last name'
  };
  const hackerData = hackerList.map(hacker => [hacker.email, hacker.firstName, hacker.lastName]);
  console.log(stringify(hackerData, { header: true, columns }));
}

function printHackersWithUnfinishedApplications(kind): PromiseLike<void> {
  return getHackersWithUnfinishedApplications(kind).then(hackers => {
    console.log(`Applicants with unfinished applications of kind ${kind}:`);
    if (hackers.length > 0) {
      outputHackers(hackers);
    } else {
      console.log('<none>');
    }
  });
}

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
  handler: createHandler(({ kind }) =>
    printHackersWithUnfinishedApplications(kind)
  ),
};
