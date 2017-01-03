const { ResponseRsvp, ApplicationTicket, HackerApplication, Hacker, db } = require('js/server/models');
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
    return application.getHacker({ transaction })
      .then(hacker => {
        Promise.all([
          slack.inviteUser(hacker.email, hacker.firstName, hacker.lastName),
          sendTicketEmail(hacker)
        ]).catch((error) => {
          // Not doing anything on error as there is no way to recover
          console.error(error);
        });

        return applicationTicket;
      });
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

/**
 * Gets all tickets with information about the applicant
 */
function getTicketsWithApplicantInfo() {
  return ApplicationTicket.findAll({
    include: [
      {
        model: HackerApplication,
        required: true,
        include: [
          {
            model: Hacker,
            required: true,
          },
        ],
      },
    ],
  }).then(tickets => tickets.map(ticket => {
    const application = ticket.hackerApplication;
    const hacker = application.hacker;

    return {
      slug: application.applicationSlug,
      firstName: hacker.firstName,
      lastName: hacker.lastName,
      gender: hacker.gender,
      country: application.countryTravellingFrom,
      institution: hacker.institution,
      email: hacker.email,
      phoneNumber: hacker.phoneNumber,
      shirtSize: hacker.shirtSize,
      dietaryRestrictions: hacker.dietaryRestrictions,
      specialNeeds: (application.hacker.specialNeeds == null) ? '' : application.hacker.specialNeeds,
      dateOfBirth: application.hacker.dateOfBirth,
    };
  }));
}

module.exports = {
  rsvpToResponse,
  getTicketsWithApplicantInfo,
};
