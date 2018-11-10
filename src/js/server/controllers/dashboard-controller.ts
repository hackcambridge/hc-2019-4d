import { UserRequest } from 'js/server/apply/router';
import * as utils from '../utils.js';
import { Hacker, TeamMember } from 'js/server/models';
import * as statuses from 'js/shared/status-constants';
import { getHackathonStartDate, getHackathonEndDate } from 'js/shared/dates';

export function showDashboard(req: UserRequest, res) {
  const content = utils.loadResource('dashboard');
  let application;
  let applicationStatus;

  req.user.getHackerApplication().then(hackerApplication => {
    application       = hackerApplication;
    applicationStatus = req.user.getApplicationStatus(hackerApplication);

    const teamApplicationStatusPromise    = req.user.getTeamApplicationStatus(hackerApplication);
    const responseStatusPromise           = req.user.getResponseStatus(hackerApplication);
    const rsvpStatusPromise               = req.user.getRsvpStatus(hackerApplication);
    const ticketStatusPromise             = req.user.getTicketStatus(hackerApplication);

    const teamMembersPromise = req.user.getTeam().then(teamMember => {
      if (teamMember === null) {
        return null;
      } else {
        const teamId = teamMember.teamId;
        return TeamMember.findAll({
          where: <any>{
            teamId: teamId,
            $not: {
              // Exclude the current user
              hackerId: req.user.id,
            }
          },
        });
      }
    }).then(teamMembers => {
      if (teamMembers == null) {
        return null;
      }
      return Promise.all(
        teamMembers.map(member => member.getHacker())
      );
    });

    return Promise.all([
      teamApplicationStatusPromise,
      responseStatusPromise,
      rsvpStatusPromise,
      teamMembersPromise,
      ticketStatusPromise,
    ]);
  }).then(([teamApplicationStatus, responseStatus, rsvpStatus, teamMembers, ticketStatus]) => {
    const overallStatus = Hacker.deriveOverallStatus(
      applicationStatus,
      responseStatus,
      teamApplicationStatus,
      rsvpStatus,
      ticketStatus
    );

    const fridayWeekday = 5;
    const fridayBeforeHackathonDate = (getHackathonStartDate().isoWeekday() > fridayWeekday) ? getHackathonStartDate().isoWeekday(fridayWeekday) : getHackathonStartDate().subtract(1, 'week').isoWeekday(fridayWeekday);

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

      statuses,
    });
  });
}