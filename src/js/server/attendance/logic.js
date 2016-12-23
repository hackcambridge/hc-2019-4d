const { ResponseRsvp, ApplicationTicket, db } = require('js/server/models');
const slack = require('js/server/slack');
const { sendEmail } = require('js/server/email');
const { response } = require('js/shared/status-constants');

const emailTemplates = require('./email-templates');

/**
 * Creates a ticket for an application.
 * 
 * Sends an email and Slack invite to the user.
 */
function createTicket(application, transaction) {
  return ApplicationTicket.create({
    hackerApplicationId: application.id,
  }, { transaction }).then((applicationTicket) => {
    // We aren't doing anything if the invitation fails. No recovery that we can do.
    application.getHacker({ transaction }).then(hacker => Promise.all([
      slack.inviteUser(hacker.email, hacker.firstName, hacker.lastName),
      sendTicketEmail(hacker)
    ]));

    return applicationTicket;
  });
}

function sendTicketEmail(hacker) {
  console.log(`Sending ticket email for hacker ${hacker.id}`);

  return sendEmail({
    to: hacker.email,
    contents: emailTemplates.newTicket({ name: hacker.firstName }),
  });
}

/**
 * Adds an RSVP for a particular application response.
 * 
 * If the RSVP is yes, then a ticket will be added to the application.
 */
function rsvpToResponse(applicationResponse, rsvpStatus) {
  if (applicationResponse.response !== response.INVITED) {
    return Promise.reject('Response is not an invitation.');
  }

  return db.transaction(transaction =>
    ResponseRsvp.create({
      applicationResponseId: applicationResponse.id,
      rsvp: rsvpStatus,
    }, { transaction }).then(responseRsvp => {
      if (responseRsvp.rsvp === ResponseRsvp.RSVP_YES) {
        return applicationResponse
          .getHackerApplication({ transaction })
          .then(application => createTicket(application, transaction))
          .then(() => responseRsvp);
      }

      return responseRsvp;
    })
  );
}

module.exports = {
  rsvpToResponse,
};
