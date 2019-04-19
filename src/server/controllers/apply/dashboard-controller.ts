import { RequestHandler } from 'express';
import * as moment from 'moment';
import * as Sequelize from 'sequelize';

import { Hacker, TeamMember } from 'server/models';
import { UserRequest } from 'server/routes/apply-router';
import * as utils from 'server/utils.js';
import * as statusConstants from 'shared/statuses';

async function getOtherTeamMembersAsHackers(user: Hacker): Promise<Hacker[]> {
  const teamMember = await user.getTeamMember();
  if (teamMember == null) {
    return null;
  }
  const otherMembers: TeamMember[] = await TeamMember.findAll({
    where: {
      teamId: teamMember.teamId,
      [Sequelize.Op.not]: {
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
    statusConstants
  });
};
