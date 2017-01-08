const Sequelize = require('sequelize');
const statuses = require('js/shared/status-constants');
const moment = require('moment');
const dates = require('js/shared/dates');
const db = require('./db');

const under18Cutoff = dates.getHackathonStartDate().subtract(18, 'years');

// Return a promise that evaluates to the team application status
const getTeamApplicationStatus = function (hackerApplication) {
  if (hackerApplication === null) return null;

  const TeamMember = require('./TeamMember');
  return TeamMember.findOne({
    where: { hackerId: hackerApplication.hackerId }
  }).then(teamApplication => {
    if (teamApplication === null) {
      // User not listed in a team application yet
      const userAppliedWithTeam = hackerApplication.inTeam;

      if (hackerApplication.wantsTeam) {
        // User wants us to place them in team
        return statuses.teamApplication.WANTS_TEAM;
      }

      if (!hackerApplication.inTeam) {
        // User didn't apply as part of a team
        return statuses.teamApplication.NOT_APPLICABLE;
      }
      
      return statuses.teamApplication.INCOMPLETE;
    } else {
      // User is listed in a team application
      return statuses.teamApplication.COMPLETE;
    }
  });
}

// Return a promise that evaluates to the response status
const getResponseStatus = function (hackerApplication) {
  if (hackerApplication === null) return null;

  return hackerApplication.getApplicationResponse().then(applicationResponse => {
    if (applicationResponse === null) {
      // No response yet
      return statuses.response.PENDING;
    } else if (applicationResponse.response == 'invited'){
      return statuses.response.INVITED;
    } else if (applicationResponse.response == 'rejected'){
      return statuses.response.REJECTED;
    }
  });
}

// Return a promise that resolves to the RSVP status of the user
const getRsvpStatus = function (hackerApplication) {
  if (hackerApplication === null) return null;
  let responsePromise = getResponseStatus(hackerApplication);

  return hackerApplication.getApplicationResponse().then(applicationResponse => {
    if (applicationResponse === null || applicationResponse.response == 'rejected') {
      // User hasn't been invited, we don't need an RSVP
      return statuses.rsvp.NA;
    } else {
      return applicationResponse.getResponseRsvp().then(rsvp => {
        if (rsvp === null) {
          // User invited but hasn't rsvp'd
          return statuses.rsvp.INCOMPLETE;
        } else if (rsvp.rsvp == 'RSVP_YES') {
          return statuses.rsvp.COMPLETE_YES;
        } else if (rsvp.rsvp == 'RSVP_NO') {
          return statuses.rsvp.COMPLETE_NO;
        } else if (rsvp.rsvp == 'RSVP_EXPIRED') {
          return statuses.rsvp.COMPLETE_EXPIRED;
        }
      });
    }
  });
}

// Returns the status of the users personal application (NOTE: not a promise)
const getApplicationStatus = function (hackerApplication) {
  if (hackerApplication === null)
    return statuses.application.INCOMPLETE;
  else
    return statuses.application.COMPLETE;
}

// Returns a promise that resolves to the ticketed status of the given application
const getTicketStatus = function (hackerApplication) {
  if (hackerApplication == null) return null;

  return hackerApplication.getApplicationTicket().then(applicationTicket => {
    if (applicationTicket == null) {
      return statuses.ticket.NO_TICKET;
    } else {
      return statuses.ticket.HAS_TICKET;
    }
  });
}

const Hacker = module.exports = db.define('hacker', {
  // Personal
  mlhId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true
  },
  firstName: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  dateOfBirth: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  email: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phoneNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  // Education
  institution: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  studyLevel: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  course: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  // Logistics
  shirtSize: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  dietaryRestrictions: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  specialNeeds: {
    type: Sequelize.TEXT,
  },
}, {
  tableName: 'hackers',
  instanceMethods: {
    // Add the instance methods
    getTeamApplicationStatus,
    getResponseStatus,
    getApplicationStatus,
    getRsvpStatus,
    getTicketStatus,
    log(logText) {
      console.log(`[User ${this.id}] ${logText}`);
    },
  }
});

Hacker.TooYoungError = class TooYoungError extends Error { };

Hacker.upsertAndFetchFromMlhUser = function (mlhUser) {
  if (moment(mlhUser.date_of_birth).isAfter(under18Cutoff)) {
    return Promise.reject(new Hacker.TooYoungError());
  }

  return Hacker.upsert({
    // Personal
    mlhId: mlhUser.id,
    firstName: mlhUser.first_name,
    lastName: mlhUser.last_name,
    gender: mlhUser.gender,
    dateOfBirth: mlhUser.date_of_birth,
    email: mlhUser.email,
    phoneNumber: mlhUser.phone_number,
    // Education
    institution: mlhUser.school.name,
    studyLevel: mlhUser.level_of_study,
    course: mlhUser.major,
    // Logistics
    shirtSize: mlhUser.shirt_size,
    dietaryRestrictions: mlhUser.dietary_restrictions,
    specialNeeds: mlhUser.special_needs,
  }).then(isNewUser => {
    if (isNewUser) {
      console.log('Created new user');
    }

    return Hacker.findOne({
      where: { mlhId: mlhUser.id }
    });
  });
};

// Determine the headline application status
Hacker.deriveOverallStatus = function (applicationStatus, responseStatus, teamApplicationStatus, rsvpStatus, ticketStatus) {

  if (applicationStatus == statuses.application.INCOMPLETE || teamApplicationStatus == statuses.application.INCOMPLETE)
    return process.env.APPLICATIONS_OPEN_STATUS === statuses.applicationsOpen.OPEN ? statuses.overall.INCOMPLETE : statuses.overall.INCOMPLETE_CLOSED;
  else if (responseStatus == statuses.response.PENDING)
    return statuses.overall.IN_REVIEW;
  else if (responseStatus == statuses.response.REJECTED)
    return statuses.overall.REJECTED;
  else if (ticketStatus == statuses.ticket.HAS_TICKET)
    return statuses.overall.HAS_TICKET;
  else if (rsvpStatus == statuses.rsvp.INCOMPLETE)
    return statuses.overall.INVITED_AWAITING_RSVP;
  else if (rsvpStatus == statuses.rsvp.COMPLETE_NO)
    return statuses.overall.INVITED_DECLINED;
  else if (rsvpStatus == statuses.rsvp.COMPLETE_EXPIRED)
    return statuses.overall.INVITED_EXPIRED;
  else if (rsvpStatus == statuses.rsvp.COMPLETE_YES)
    return statuses.overall.INVITED_ACCEPTED;
  else {
    console.log("Couldn't derive an overall status");
    console.log({
      applicationStatus,
      responseStatus,
      teamApplicationStatus,
      rsvpStatus,
      ticketStatus,
    });
    throw new Error("Couldn't derive an overall status");
  }
}