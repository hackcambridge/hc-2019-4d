import * as stringify from 'csv-stringify/lib/sync';

import { Hacker, HackerInstance } from 'server/models';
import { assertNever } from 'shared/common';
import { IndividualApplicationStatus, TeamApplicationStatus } from 'shared/statuses';

export enum UnfinishedApplicationKind {
  INDIVIDUAL = 'individual',
  TEAM_ONLY = 'team-only',
}

export async function getHackersWithUnfinishedApplications(kind: UnfinishedApplicationKind): Promise<HackerInstance[]> {
  const hackers = await Hacker.findAll();
  const hackerStatuses = await Promise.all(hackers.map(hacker => hacker.getStatuses()));
  const hackerResults = hackers.map((hacker, i) => {
    switch (kind) {
      case UnfinishedApplicationKind.INDIVIDUAL:
        return hackerStatuses[i].individualApplicationStatus === IndividualApplicationStatus.INCOMPLETE ? hacker : null;
      case UnfinishedApplicationKind.TEAM_ONLY:
        // The value of teamApplicationStatus is null if the individual application hasn't been finished,
        // so ensure we only return the hacker when teamApplicationStatus is INCOMPLETE.
        return hackerStatuses[i].teamApplicationStatus === TeamApplicationStatus.INCOMPLETE ? hacker : null;
      default:
        return assertNever(kind);
    }
  });
  return hackerResults.filter(result => result !== null);
}

function csvOfHackers(hackerList: ReadonlyArray<HackerInstance>): string {
  const columns = {
    email: 'Email',
    firstName: 'First name',
    lastName: 'Last name'
  };
  const hackerData = hackerList.map(hacker => [hacker.email, hacker.firstName, hacker.lastName]);
  return stringify(hackerData, { header: true, columns });
}

export async function getCsvOfHackersWithUnfinishedApplications(kind): Promise<string> {
  const unfinishedHackers = await getHackersWithUnfinishedApplications(kind);
  return csvOfHackers(unfinishedHackers);
}
