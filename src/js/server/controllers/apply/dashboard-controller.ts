import { RequestHandler } from 'express';

import { Hacker, HackerInstance, TeamMember } from 'js/server/models';
import { UserRequest } from 'js/server/routes/apply-router';
import * as utils from 'js/server/utils.js';
import { getHackathonEndDate, getHackathonStartDate } from 'js/shared/dates';
import * as statusConstants from 'js/shared/status-constants';

async function getOtherTeamMembersAsHackers(user: HackerInstance): Promise<HackerInstance[]> {
  const teamMember = await user.getTeam();
  if (teamMember == null) {
    return null;
  }
  const otherMembers = await TeamMember.findAll({
    where: {
      teamId: teamMember.teamId,
      $not: {
        // Exclude the current user
        hackerId: user.id,
      }
    } as any,
  });
  if (otherMembers == null) {
    return null;
  }
  return Promise.all(otherMembers.map(member => member.getHacker()));
}

export const showDashboard: RequestHandler = async (req: UserRequest, res) => {
  const statusMessages = utils.loadResource('dashboard');

  const [application, statuses, teamMembers] = await Promise.all([
    req.user.getHackerApplication(),
    req.user.getStatuses(),
    getOtherTeamMembersAsHackers(req.user)
  ]);

  const fridayWeekday = 5;
  const fridayBeforeHackathonDate =
    (getHackathonStartDate().isoWeekday() > fridayWeekday)
      ? getHackathonStartDate().isoWeekday(fridayWeekday)
      : getHackathonStartDate().subtract(1, 'week').isoWeekday(fridayWeekday);

  res.render('apply/dashboard', {
    application,
    statuses,
    statusMessages,
    teamMembers,
    applicationsOpenStatus: process.env.APPLICATIONS_OPEN_STATUS,
    hackathonStartDate: getHackathonStartDate().format('dddd DDDo MMM YYYY'),
    hackathonEndDate: getHackathonEndDate().format('dddd DDDo MMM'),
    fridayBeforeHackathonDate: fridayBeforeHackathonDate.format('DDDo MMM'),
    statusConstants
  });
};
