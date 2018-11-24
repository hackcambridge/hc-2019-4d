import { sendEmail } from 'server/email';
import { ApplicationTicket, Hacker, HackerApplication } from 'server/models';
import { HackerApplicationInstance } from 'server/models/HackerApplication';
import * as slack from 'server/slack';
import * as emailTemplates from './email-templates';

const ROLE_ORDERING = ['development', 'design', 'product_management', 'unknown'];
const TARGET_TEAM_SIZE = 4;

export interface TeamMemberDetails {
  applicationId: number;
  hackerId: number;
  ticketId: number;
  roles: string[];
  email: string;
  firstName: string;
  lastName: string;
  slackName: string;
}

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

function getHighestPriorityRoleIndex(application: HackerApplicationInstance) {
  ROLE_ORDERING.forEach((role, roleIndex) => {
    if (application.developmentRoles.includes(role)) {
      return roleIndex;
    }
  });
  return ROLE_ORDERING.length;
}

function applicationDevelopmentComparison(applicationA, applicationB) {
  return getHighestPriorityRoleIndex(applicationA) - getHighestPriorityRoleIndex(applicationB);
}

function createEmptyTeams(applications: HackerApplicationInstance[]): HackerApplicationInstance[][] {
  const teamCount = Math.ceil(applications.length / TARGET_TEAM_SIZE);

  return new Array(teamCount).fill(0).map(() => []);
}

function assignApplicationsToTeams(applications: HackerApplicationInstance[]) {
  const applicationsToAssign = applications.slice(0);
  let teamIndex = 0;
  const teams = createEmptyTeams(applicationsToAssign);

  applications.forEach(application => {
    teams[teamIndex % teams.length].push(application);
    teamIndex += 1;
  });

  return teams;
}

function getApplicationsSortedByRole(unsortedApplications: HackerApplicationInstance[]) {
  const sortedApplications = unsortedApplications.slice(0);

  sortedApplications.sort(applicationDevelopmentComparison);

  return sortedApplications;
}

function createTeamAssignments(): PromiseLike<HackerApplicationInstance[][]> {
  return getAllApplicationsWantingTeams()
    .then(getApplicationsSortedByRole)
    .then(assignApplicationsToTeams);
}

function getSlackNameForEmail(slackUsers, email): string {
  for (const user of slackUsers) {
    if (user.profile.email === email) {
      return user.name;
    }
  }

  return null;
}

function serializeTeams(teams, slackUsers): TeamMemberDetails[][] {
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

export function sendTeamEmail(team) {
  const teamIdentifier = team.map(member => member.hackerId).join(', ');
  console.log(`Sending team email to ${teamIdentifier}`);

  return sendEmail({
    to: team.map(member => member.email),
    contents: emailTemplates.teamAllocation({ team }),
  }).catch(error => {
    console.error(`Sending team email to ${teamIdentifier} failed: `, error);
  });
}

export function getSerializedTeamAssignments() {
  return Promise.all([
    createTeamAssignments(),
    slack.getUsers(),
  ]).then(([teams, slackUsers]) => serializeTeams(teams, slackUsers));
}
