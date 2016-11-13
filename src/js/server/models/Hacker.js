const Sequelize = require('sequelize');
const statuses = require('js/shared/status-constants');
const db = require('./db');

// Return a promise that evaluates to the team application status
const getTeamApplicationStatus = function (hackerApplication) {
  if (hackerApplication === null) return null;

  const userAppliedWithTeam = hackerApplication.inTeam;

  if (hackerApplication.wantsTeam) {
    // User wants us to place them in team
    return statuses.teamApplication.WANTS_TEAM;
  }

  if (!hackerApplication.inTeam) {
    // User didn't apply as part of a team
    return statuses.teamApplication.NOT_APPLICABLE;
  }

  // User applied as part of a team
  
  // TODO: hackerApplication.getTeamApplication().then...
  const temporary_dummy = Promise.resolve(null);
  return temporary_dummy.then(teamApplication => {
    if (teamApplication === null) {
      // User not listed in a team application yet
      return statuses.teamApplication.INCOMPLETE;
    } else {
      // User is listed in a team application
      return statuses.teamApplication.COMPLETE;
    }
  });
}

// Return a promise taht evaluates to the response status
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

// Return a promise that evaluates to the status of the users further details form
const getFurtherDetailsStatus = function (hackerApplication) {
  if (hackerApplication === null) return null;

   // TODO: hackerApplication.getFurtherDetails().then...
  const temporary_dummy = Promise.resolve(null);
  return temporary_dummy.then(furtherDetails => {
    if (furtherDetails === null) {
      return statuses.furtherDetails.INCOMPLETE;
    } else {
      return statuses.furtherDetails.COMPLETE;
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
    getTeamApplicationStatus: getTeamApplicationStatus,
    getResponseStatus: getResponseStatus,
    getFurtherDetailsStatus: getFurtherDetailsStatus,
    getApplicationStatus: getApplicationStatus
  }
});

Hacker.upsertAndFetchFromMlhUser = function (mlhUser) {
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

    return Hacker.findOne({ mlhId: mlhUser.id });
  });
};

// Determine the headline application status
Hacker.deriveOverallStatus = function (applicationStatus, responseStatus, teamApplicationStatus, furtherDetailsStatus) {
  if (applicationStatus==statuses.application.INCOMPLETE || teamApplicationStatus==statuses.application.INCOMPLETE)
    return statuses.overall.INCOMPLETE;
  else if (responseStatus == statuses.response.PENDING)
    return statuses.overall.IN_REVIEW;
  else if (responseStatus == statuses.response.REJECTED)
    return statuses.overall.REJECTED;
  else if (furtherDetailsStatus == statuses.furtherDetails.INCOMPLETE)
    return statuses.overall.ACCEPTED_INCOMPLETE;
  else if (furtherDetailsStatus == statuses.furtherDetails.COMPLETE)
    return statuses.overall.ACCEPTED_COMPLETE;
}