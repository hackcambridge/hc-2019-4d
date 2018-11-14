import { RequestHandler } from 'express';

import { UserRequest } from 'js/server/apply/router';
import * as utils from 'js/server/utils.js';
import { Hacker, TeamMember, HackerInstance } from 'js/server/models';
import * as statuses from 'js/shared/status-constants';
import { getHackathonStartDate, getHackathonEndDate } from 'js/shared/dates';

async function getOtherTeamMembersAsHackers(user: HackerInstance): Promise<HackerInstance[]> {
  const teamMember = await user.getTeam();
  if (teamMember == null) {
    return null;
  }
  const otherMembers = await TeamMember.findAll({
    where: <any>{
      teamId: teamMember.teamId,
      $not: {
        // Exclude the current user
        hackerId: user.id,
      }
    },
  });
  if (otherMembers == null) {
    return null;
  }
  return Promise.all(otherMembers.map(member => member.getHacker()));
}

export const showDashboard: RequestHandler = async (req: UserRequest, res) => {
  const content = utils.loadResource('dashboard');

  const application = await req.user.getHackerApplication();
  const applicationStatus = req.user.getApplicationStatus(application);

  const [teamApplicationStatus, responseStatus, rsvpStatus, ticketStatus, teamMembers] = await Promise.all([
    req.user.getTeamApplicationStatus(application),
    req.user.getResponseStatus(application),
    req.user.getRsvpStatus(application),
    req.user.getTicketStatus(application),
    getOtherTeamMembersAsHackers(req.user)
  ]);

  const overallStatus = Hacker.deriveOverallStatus(
    applicationStatus,
    responseStatus,
    teamApplicationStatus,
    rsvpStatus,
    ticketStatus
  );

  const fridayWeekday = 5;
  const fridayBeforeHackathonDate =
    (getHackathonStartDate().isoWeekday() > fridayWeekday)
      ? getHackathonStartDate().isoWeekday(fridayWeekday)
      : getHackathonStartDate().subtract(1, 'week').isoWeekday(fridayWeekday);

  res.render('apply/dashboard.html', {
    applicationSlug: (application === null) ? null : application.applicationSlug,
    applicationStatus,
    wantsTeam: (application === null) ? null : application.wantsTeam,
    teamApplicationStatus,
    responseStatus,
    rsvpStatus,
    ticketStatus,
    overallStatus,

    applicationInfo: content['your-application'][applicationStatus],
    teamApplicationInfo: content['team-application'][teamApplicationStatus],
    rsvpInfo: content['rsvp'][rsvpStatus],
    statusMessage: content['status-messages'][overallStatus],
    teamMembers,

    applicationsOpenStatus: process.env.APPLICATIONS_OPEN_STATUS,

    hackathonStartDate: getHackathonStartDate().format('dddd DDDo MMM YYYY'),
    hackathonEndDate: getHackathonEndDate().format('dddd DDDo MMM'),
    fridayBeforeHackathonDate: fridayBeforeHackathonDate.format('DDDo MMM'),

    statuses
  });
};
