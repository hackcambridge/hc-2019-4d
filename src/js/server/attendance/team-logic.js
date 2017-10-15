const { HackerApplication, ApplicationTicket, Hacker } = require('js/server/models');
const slack = require('js/server/slack');
const { sendEmail } = require('js/server/email');

const emailTemplates = require('./email-templates');

const ROLE_ORDERING = ['development', 'design', 'product_management', 'unknown'];
const TARGET_TEAM_SIZE = 4;

function getAllApplicationsWantingTeams() {
  return HackerApplication.findAll({
    where: {
      wantsTeam: true,
    },
    include: [
      {
        model: ApplicationTicket,
        required: true,
      },
      {
        model: Hacker,
        required: true,
      },
    ],
  });
}

function getHighestPriorityRoleIndex(application) {
  for (let roleIndex in ROLE_ORDERING) {
    if (application.developmentRoles.includes(ROLE_ORDERING[roleIndex])) {
      return roleIndex;
    }
  }

  return ROLE_ORDERING.length;
}

function applicationDevelopmentComparison(applicationA, applicationB) {
  return getHighestPriorityRoleIndex(applicationA) - getHighestPriorityRoleIndex(applicationB);
}

function createEmptyTeams(applications) {
  const teamCount = Math.ceil(applications.length / TARGET_TEAM_SIZE);

  return new Array(teamCount).fill(0).map(() => []);
}

function assignApplicationsToTeams(applications) {
  const applicationsToAssign = applications.slice(0);
  let teamIndex = 0;
  const teams = createEmptyTeams(applicationsToAssign);

  applications.forEach((application) => {
    teams[teamIndex % teams.length].push(application);
    teamIndex += 1;
  });
  
  return teams;
}

function getApplicationsSortedByRole(unsortedApplications) {
  const sortedApplications = unsortedApplications.slice(0);

  sortedApplications.sort(applicationDevelopmentComparison);

  return sortedApplications;
}

function createTeamAssignments() {
  return getAllApplicationsWantingTeams()
    .then(getApplicationsSortedByRole)
    .then(assignApplicationsToTeams);
}

function getSlackNameForEmail(slackUsers, email) {
  for (let user of slackUsers) {
    if (user.profile.email === email) {
      return user.name;
    }
  }

  return null;
}

function serializeTeams(teams, slackUsers) {
  return teams.map(team => team.map(
    application => ({
      applicationId: application.id,
      hackerId: application.hacker.id,
      ticketId: application.applicationTicket.id,
      roles: application.developmentRoles,
      email: application.hacker.email,
      firstName: application.hacker.firstName,
      lastName: application.hacker.lastName,
      slackName: getSlackNameForEmail(slackUsers, application.hacker.email),
    })
  ));
}

function sendTeamEmail(team) {
  const teamIdentifier = team.map(member => member.hackerId).join(', ');
  console.log(`Sending team email to ${teamIdentifier}`);

  return sendEmail({
    to: team.map(member => member.email),
    contents: emailTemplates.teamAllocation({ team }),
  }).catch((error) => {
    console.error(`Sending team email to ${teamIdentifier} failed: `, error);
  });
}

function getSerializedTeamAssignments() {
  return Promise.all([
    createTeamAssignments(),
    slack.getUsers(),
  ]).then(([teams, slackUsers]) => serializeTeams(teams, slackUsers));
}

module.exports = {
  getSerializedTeamAssignments,
  sendTeamEmail,
};
