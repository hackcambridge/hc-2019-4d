import { checkSchema, validationResult, ValidationSchema } from 'express-validator/check';

import { UserRequest } from 'js/server/apply/router';
import { HackerApplication, ApplicationResponse, Team, TeamMember } from 'js/server/models';
import { sendEmail } from 'js/server/email';
import * as emailTemplates from 'js/server/apply/email-templates';

const schema: ValidationSchema = {
  'members.b': {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'Fill out this field',
    },
  },
  'members.c': {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'Fill out this field',
    },
  },
  'members.d': {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'Fill out this field',
    },
  },
}

export function newTeam(req: UserRequest, res) {
  req.user.getHackerApplication().then(hackerApplication => {
    if (hackerApplication !== null) {
      req.user.getTeam().then(team => {
        if (team === null) {
          res.render('apply/team.html', { applicationSlug: hackerApplication.applicationSlug });
        } else if (team !== null) {
          res.redirect('/apply/dashboard');
        }
      });
    } else if (hackerApplication === null)  {
      res.redirect('/apply/form');
    }
  });
}

export const createTeam = [
  checkSchema(schema),
  (req: UserRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(req);
      res.render('apply/team.html', {
        errors: errors.mapped(),
        formData: req.body,
      });
    } else {
      console.log(req)
      createTeamFromForm(req.body, req.user, errors);
      res.redirect('dashboard');
    }
  }
]

export function createTeamFromForm(body, user, errors) {
  const members = new Set();
  const hackerIds = [user.id];
  const applicationSlugs = {
    'memberB': body.members.b,
    'memberC': body.members.c,
    'memberD': body.members.d,
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
