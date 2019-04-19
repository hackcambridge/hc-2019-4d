import * as moment from 'moment';

import { sendEmail } from 'server/email';
import { ApplicationResponse, db, Hacker, HackerApplication, Team, TeamMember } from 'server/models';
import { assertNever } from 'shared/common';
import { ResponseStatus } from 'shared/statuses';
import { INVITATION_VALIDITY_DURATION } from './constants';
import * as emailTemplates from './email-templates';
import { applicationHasBeenIndividuallyScored } from './score-logic';

export type DecidedResponseStatus = ResponseStatus.INVITED | ResponseStatus.REJECTED;

/**
 * Normalizes teams and non-teams into an array that either contains a
 * single application, or all applications from the team that the input
 * belongs to.
 */
function normalizeApplicationTeams(application: HackerApplication): Promise<HackerApplication[]> {
  return application.getHacker().then(hacker => {
    return TeamMember.findOne({
      where: {
        hackerId: hacker.id
      },
      // We're going deeper and deeper...
      include: [
        {
          model: Team,
          include: [
            {
              model: TeamMember,
              include: [
                {
                  model: Hacker,
                  include: [HackerApplication],
                },
              ],
            },
          ],
        },
      ],
    }).then(teamMember => {
      if (teamMember == null) {
        return [application];
      }

      return teamMember.team.teamMembers.map(member => member.hacker.hackerApplication);
    });
  });
}

/**
 * Returns a promise that resolves with the applications if all applications have been scored,
 * and rejects if any one of them have not been.
 */
function checkApplicationsAreScored(applications: HackerApplication[]): Promise<HackerApplication[]> {
  return Promise
    .all(applications.map(applicationHasBeenIndividuallyScored))
    .then(applicationValidities => applicationValidities.every(validity => validity))
    .then(areApplicationsValid => {
      if (!areApplicationsValid) {
        throw new Error('Not all applications have been scored fully');
      }

      return applications;
    });
}

/**
 * Sets a response for an individual application.
 *
 * Returns a promise that resolves with whether the application is new or not
 */
function setResponseForApplication(application: HackerApplication, responseStatus: DecidedResponseStatus, transaction) {
  console.log(`Setting response for application ${application.id} to "${responseStatus}"`);
  const responseContent = {
    response: responseStatus,
    hackerApplicationId: application.id,
    // Expire the invitation at the end of the day to give hackers the full final day to respond.
    expiryDate: moment().add(INVITATION_VALIDITY_DURATION).endOf('day').toDate()
  };

  return ApplicationResponse.findOne({
    where: {
      hackerApplicationId: application.id,
    },
    transaction,
  }).then(applicationResponse => {
    if (applicationResponse != null) {
      return applicationResponse.update(responseContent, { transaction }).then(() => false);
    }

    return ApplicationResponse.create(responseContent, { transaction }).then(() => true);
  });
}

/**
 * Sets the response for a set of applications in an ACID-safe way
 */
function setResponseForApplications(applications: HackerApplication[], responseStatus: DecidedResponseStatus):
  PromiseLike<Array<{application: HackerApplication, isApplicationNew: boolean}>> {
  return db.transaction(transaction =>
    Promise.all(
      applications.map(application =>
        setResponseForApplication(application, responseStatus, transaction)
          .then(isApplicationNew => ({ application, isApplicationNew }))
      )
    )
  );
}

function getEmailForApplicationResponse(hacker: Hacker, responseStatus: DecidedResponseStatus) {
  switch (responseStatus) {
    case ResponseStatus.INVITED:
      return emailTemplates.invited({
        name: hacker.firstName,
        daysValid: INVITATION_VALIDITY_DURATION.asDays(),
      });
    case ResponseStatus.REJECTED:
      return emailTemplates.notInvited({ name: hacker.firstName });
    default:
      return assertNever(responseStatus);
  }
}

function sendEmailForApplicationResponse(application: HackerApplication, responseStatus: DecidedResponseStatus) {
  console.log(`Sending response email for application ${application.id}`);

  return application.getHacker().then(hacker =>
    sendEmail({
      to: hacker.email,
      contents: getEmailForApplicationResponse(hacker, responseStatus),
    })
  );
}

/**
 * Sets the response to an application while enforcing our requirements:
 *
 * - An application must be validly scored
 * - Any applicants in the same team will receive the same status
 * - If this is the application's first response (99% of cases), an email will be sent
 */
export function setResponseForApplicationWithChecks(originalApplication, responseStatus: DecidedResponseStatus) {
  return normalizeApplicationTeams(originalApplication)
    .then(checkApplicationsAreScored)
    .then(applications => setResponseForApplications(applications, responseStatus))
    .then(applicationCreationStatuses =>
      Promise.all(
        applicationCreationStatuses
          .filter(({ isApplicationNew }) => isApplicationNew)
          .map(({ application }) =>
            sendEmailForApplicationResponse(application, responseStatus)
              // No way to recover on error
              .catch(console.error)
          )
      )
    ).then(() => ({ response: responseStatus }));
}
