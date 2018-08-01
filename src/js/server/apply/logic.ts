import * as generate from 'adjective-adjective-animal';

import { HackerApplication, ApplicationResponse, Team, TeamMember } from 'js/server/models';
import { sendEmail } from 'js/server/email';
import * as emailTemplates from './email-templates';

export function createApplicationFromForm(formData, user) {
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
      inTeam: formData.team.includes('team_apply'),
      wantsTeam: formData.team.includes('team_placement'),
    });
  }).then(application => {
    sendEmail({
      to: user.email, 
      contents: emailTemplates.applied({
        name: user.firstName,
        applicationSlug: application.applicationSlug,
        inTeam: application.inTeam,
      }),
    }).catch(console.log.bind(console));
    user.log('Application made successfully');
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
}

export function createTeamFromForm(formData, user, errors) {
  const members = new Set();
  const hackerIds = [user.id];
  const applicationSlugs = {
    'memberB': formData.memberB,
    'memberC': formData.memberC,
    'memberD': formData.memberD,
  };
  // Ensure application slugs are unique and not the applicant's own
  return user.getHackerApplication().then(application => {
    // Start off with the current hacker's application slug — we already know they're in the team
    members.add(application.applicationSlug);
    return new Promise((resolve, reject) => {
      for (const field in applicationSlugs) {
        applicationSlugs[field] = applicationSlugs[field].trim();
        if (applicationSlugs[field] !== '') {
          if (!members.has(applicationSlugs[field])) {
            members.add(applicationSlugs[field]);
          } else {
            throw new Error(errors[field] = 'Each application ID must be distinct.');
          }
        } else {
          delete applicationSlugs[field];
        }
      }
      resolve();
    });
  }).then(() => {
    if (members.size > 1) {
      return Promise.all(Object.keys(applicationSlugs).map(field => {
        const applicationSlug = applicationSlugs[field];
        return HackerApplication.findOne({
          where: { applicationSlug }
        }).then(application => {
          if (application === null) {
            // The application slug was not valid
            throw new Error(errors[field] = 'There aren\'t any applications with this ID!');
          }
          return application;
        }).then(application => {
          hackerIds.push(application.hackerId);
          return TeamMember.findOne({
            where: { hackerId: application.hackerId }
          }).then(team => {
            if (team !== null) {
              // The hacker is already part of another team
              throw new Error(errors[field] = 'This applicant is already part of a different team!');
            }
            return ApplicationResponse.findOne({
              where: { hackerApplicationId: application.id }
            });
          }).then(applicationResponse => {
            if (applicationResponse !== null) {
              // The hacker has already been either accepted or rejected
              throw new Error(errors[field] = 'This applicant has already been reviewed.');
            }
            return applicationResponse;
          });
        });
      }));
    } else {
      throw new Error(errors['memberB'] = 'You need at least two team members to form a team.');
    }
  }).then(() => {
    // Create a new team
    return Team.create({ }).then(team => {
      // Add the team members to the team
      return Promise.all(hackerIds.map(hackerId => {
        return TeamMember.create({
          teamId: team.id,
          hackerId
        });
      }));
    });
  });
}
