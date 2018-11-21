import { Hacker, HackerInstance, HackerStatuses } from 'js/server/models';
import { getApplicationStatus, getTeamApplicationStatus } from 'js/server/models/Hacker';
import * as statuses from 'js/shared/status-constants';

export const unfinishedApplicationKind = { INDIVIDUAL: 'individual', TEAM_ONLY: 'team-only' };

export function getHackersWithUnfinishedApplications(kind) {
  return Hacker.findAll().then((hackers: HackerInstance[]) =>
    Promise.all(hackers.map((hacker: HackerInstance) =>
      hacker.getStatuses()
        .then((hackerStatuses: HackerStatuses) => {
          if (kind === unfinishedApplicationKind.INDIVIDUAL) {
            return hackerStatuses.applicationStatus === statuses.application.INCOMPLETE ? hacker : null;
          } else if (kind === unfinishedApplicationKind.TEAM_ONLY) {
            // The value of teamApplicationStatus is null if the individual application hasn't been finished,
            // so ensure we only return the hacker when teamApplicationStatus is INCOMPLETE.
            return hackerStatuses.teamApplicationStatus === statuses.teamApplication.INCOMPLETE ? hacker : null;
          } else {
            throw Error('Unknown unfinished application kind');
          }
        })
      )
    ).then(hackerResults => hackerResults.filter(result => result !== null))
  );
}
