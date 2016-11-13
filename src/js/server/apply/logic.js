const crypto = require('crypto');
const { HackerApplication } = require('js/server/models');
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
