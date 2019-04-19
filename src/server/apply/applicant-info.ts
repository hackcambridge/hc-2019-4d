import * as stringify from 'csv-stringify/lib/sync';

import { Hacker } from 'server/models';
import { assertNever } from 'shared/common';
import { IndividualApplicationStatus, TeamApplicationStatus } from 'shared/statuses';

export enum UnfinishedApplicationKind {
  INDIVIDUAL = 'individual',
  TEAM_ONLY = 'team-only',
}

export async function getHackersWithUnfinishedApplications(kind: UnfinishedApplicationKind): Promise<Hacker[]> {
  const hackers: Hacker[] = await Hacker.findAll();
  const hackerStatuses = await Promise.all(hackers.map(hacker => hacker.getStatuses()));
  return hackers.filter((_hacker, i) => {
    switch (kind) {
      case UnfinishedApplicationKind.INDIVIDUAL:
        return hackerStatuses[i].individualApplicationStatus === IndividualApplicationStatus.INCOMPLETE;
      case UnfinishedApplicationKind.TEAM_ONLY:
        // The value of teamApplicationStatus is null if the individual application hasn't been finished,
        // so ensure we only return the hacker when teamApplicationStatus is INCOMPLETE.
        return hackerStatuses[i].teamApplicationStatus === TeamApplicationStatus.INCOMPLETE;
      default:
        return assertNever(kind);
    }
  });
}

function csvOfHackers(hackerList: ReadonlyArray<Hacker>): string {
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
