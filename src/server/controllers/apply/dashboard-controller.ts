import { RequestHandler } from 'express';
import * as moment from 'moment';

import { HackerInstance, TeamMember } from 'server/models';
import { UserRequest } from 'server/routes/apply-router';
import * as utils from 'server/utils.js';
import { getHackathonEndDate, getHackathonStartDate } from 'shared/dates';
import * as statusConstants from 'shared/status-constants';

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

function getFridayBeforeHackathonDate(): moment.Moment {
  const fridayWeekday = 5;
  return getHackathonStartDate().isoWeekday() > fridayWeekday
      ? getHackathonStartDate().isoWeekday(fridayWeekday)
      : getHackathonStartDate().subtract(1, 'week').isoWeekday(fridayWeekday);
}

export const showDashboard: RequestHandler = async (req: UserRequest, res) => {
  const [application, statuses, teamMembers] = await Promise.all([
    req.user.getHackerApplication(),
    req.user.getStatuses(),
    getOtherTeamMembersAsHackers(req.user)
  ]);

  const applicationResponse = application == null ? null : await application.getApplicationResponse();
  const expiryDate = applicationResponse == null ? null : moment(applicationResponse.expiryDate);

  const statusMessages = utils.loadResource('dashboard', {
    expiryDate
  });

  res.render('apply/dashboard', {
    application,
    statuses,
    statusMessages,
    teamMembers,
    applicationsOpenStatus: process.env.APPLICATIONS_OPEN_STATUS,
    hackathonStartDate: getHackathonStartDate().format('DD/MM/YY'),
    hackathonEndDate: getHackathonEndDate().format('DD/MM/YY'),
    fridayBeforeHackathonDate: getFridayBeforeHackathonDate().format('DDDo MMM'),
    statusConstants
  });
};
