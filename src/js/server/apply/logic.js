const crypto = require('crypto');
const { HackerApplication, Team, TeamMember } = require('js/server/models');
const { sendEmail } = require('js/server/email');
const emailTemplates = require('./email-templates');
const generate = require("adjective-adjective-animal");

exports.createApplicationFromForm = function (formData, user) {
  return generate().then(slug => {
    return HackerApplication.create({
      // Foreign key
      hackerId: user.id,
      // Application
      applicationSlug: slug,
      cv: formData.cv.location,
      countryTravellingFrom: formData.countryTravellingFrom,
      developmentRoles: formData.development,
      learningGoal: formData.learn,
      interests: formData.interests,
      recentAccomplishment: formData.accomplishment,
      links: formData.links,
      inTeam: formData.team_apply,
      wantsTeam: formData.team_placement,
    })
  }).then(application => {
    sendEmail({
      to: user.email, 
      contents: emailTemplates.applied({
        name: user.firstName,
        applicationSlug: application.applicationSlug,
        inTeam: application.inTeam,
      }),
    }).catch(console.log.bind(console));

    console.log(`An application was successfully made by ${user.firstName} ${user.lastName}.`);
    return application;
  }).catch(err => {
    if (err.name == 'SequelizeUniqueConstraintError' && err.errors[0].path === 'applicationSlug') {
      // slug was not unique, try again with new slug
      console.log('Application slug collision detected');
      return exports.createApplicationFromForm(formData, user);
    } else {
      console.log('Failed to add an application to the database');
      return Promise.reject(err);
    }
    
  });
};

exports.createTeamFromForm = function (formData, user) {
  const members = new Set();
  const hackerIds = [];
  // Ensure application slugs are unique and not the applicant's own
  return user.getHackerApplication().then(application => {
    // Start off with the current hacker's application slug — we already know they're in the team
    members.add(application.applicationSlug);
  }).then(new Promise((resolve, reject) => {
    for (const applicationSlug of [formData.memberB, formData.memberC, formData.memberD].map(s => s.trim()).filter(s => s !== '')) {
      if (!members.has(applicationSlug)) {
        members.add(applicationSlug);
      } else {
        throw new Error('Application slugs must be distinct.');
      }
    }
    resolve();
  })).then(() => {
    const applicationSlugs = Array.from(members);
    if (applicationSlugs.length > 1) {
      return Promise.all(applicationSlugs.map(applicationSlug => {
        return HackerApplication.findOne({
          where: { applicationSlug }
        }).then(application => {
          if (application === null) {
            // The application slug was not valid
            throw new Error('The application slug matched no hacker.');
          }
          return application;
        }).then(application => {
          hackerIds.push(application.hackerId);
          return TeamMember.findOne({
            where: { hackerId: application.hackerId }
          }).then(application => {
            if (application !== null) {
              // The hacker is already part of another team
              throw new Error('A team member can\'t belong to more than one team.');
            }
          });
        });
      }));
    } else {
      throw new Error('You need at least two team members to form a team.');
    }
  }).then(() => {
    // Create a new team
    Team.create({ }).then(team => {
      // Add the team members to the team
      for (const hackerId of hackerIds) {
        TeamMember.create({
          teamId: team.id,
          hackerId
        });
      }
    });
  });
};