const { HackerApplication, ApplicationResponse, Team, TeamMember, Hacker, db } = require('js/server/models');
const { sendEmail } = require('js/server/email');
const { response } = require('js/shared/status-constants');
const emailTemplates = require('./email-templates');

function isApplicationScoreValid(application) {
  // TODO: Make this work
  return Promise.resolve(false);
}

/**
 * Normalizes teams and non-teams into an array that either contains a
 * single application, or all applications from the team that the input
 * belongs to.
 */
function normalizeApplicationTeams(application) {
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
function checkApplicationsAreScored(applications) {
  return Promise
    .all(applications.map(isApplicationScoreValid))
    .then(applicationValidities => applicationValidities.every(validity => validity))
    .then(areApplicationsValid => {
      if (!areApplicationsValid) {
        throw new Error('Not all applications have been scored fully');
      }

      return applications;
    })
}

/**
 * Sets a response for an individual application.
 * 
 * Returns a promise that resolves with whether the application is new or not
 */
function setResponseForApplication(application, responseStatus, transaction) {
  console.log(`Setting response for application ${application.id} to "${responseStatus}"`);
  const responseContent = {
    response: responseStatus,
    hackerApplicationId: application.id,
  };

  return ApplicationResponse.findOne({
    where: {
      hackerApplicationId: application.id,
    },
    transaction,
  }).then((applicationResponse) => {
    if (applicationResponse != null) {
      return applicationResponse.update(responseContent, { transaction }).then(() => false);
    }

    return ApplicationResponse.create(responseContent, { transaction }).then(() => true);
  });
}

/**
 * Sets the response for a set of applications in an ACID-safe way
 */
function setResponseForApplications(applications, responseStatus) {
  return db.transaction(transaction =>
    Promise.all(
      applications.map(application => 
        Promise
          .all([application, setResponseForApplication(application, responseStatus, transaction)])
          .then(([ application, isApplicationNew ]) => ({ application, isApplicationNew }))
        )
    )
  );
}

function getEmailForApplicationResponse(hacker, responseStatus) {
  if (responseStatus === response.INVITED) {
    return emailTemplates.invited({ name: hacker.firstName });
  }

  if (responseStatus === response.REJECTED) {
    return emailTemplates.notInvited({ name: hacker.firstName });
  }

  throw new Error(`Could not find template for response "${responseStatus}"`);
}

function sendEmailForApplicationResponse(application, responseStatus) {
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
exports.setResponseForApplicationWithChecks = function setResponseForApplicationWithChecks(originalApplication, responseStatus) {
  return normalizeApplicationTeams(originalApplication)
    .then(checkApplicationsAreScored)
    .then(applications => setResponseForApplications(applications, responseStatus))
    .then((applicationCreationStatuses) => {
      // We do not return these promises as they are just fire and forget
      // No way to recover on error
      applicationCreationStatuses
        .filter(({ isApplicationNew }) => isApplicationNew)
        .forEach(({ application }) => sendEmailForApplicationResponse(application, responseStatus))
    }).then(() => ({ response: responseStatus }));
};
