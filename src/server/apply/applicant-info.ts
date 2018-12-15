import { Hacker, HackerInstance } from 'server/models';
import { HackerStatuses, IndividualApplicationStatus, TeamApplicationStatus } from 'shared/status-constants';

export const unfinishedApplicationKind = { INDIVIDUAL: 'individual', TEAM_ONLY: 'team-only' };

export function getHackersWithUnfinishedApplications(kind) {
  return Hacker.findAll().then((hackers: HackerInstance[]) =>
    Promise.all(hackers.map((hacker: HackerInstance) =>
      hacker.getStatuses()
        .then((hackerStatuses: HackerStatuses) => {
          if (kind === unfinishedApplicationKind.INDIVIDUAL) {
            return hackerStatuses.individualApplicationStatus === IndividualApplicationStatus.INCOMPLETE ? hacker : null;
          } else if (kind === unfinishedApplicationKind.TEAM_ONLY) {
            // The value of teamApplicationStatus is null if the individual application hasn't been finished,
            // so ensure we only return the hacker when teamApplicationStatus is INCOMPLETE.
            return hackerStatuses.teamApplicationStatus === TeamApplicationStatus.INCOMPLETE ? hacker : null;
          } else {
            throw Error('Unknown unfinished application kind');
          }
        })
      )
    ).then(hackerResults => hackerResults.filter(result => result !== null))
  );
}
