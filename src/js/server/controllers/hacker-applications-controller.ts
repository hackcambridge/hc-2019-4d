import * as generate from 'adjective-adjective-animal';
import { checkSchema, validationResult, ValidationSchema } from 'express-validator/check';
import * as validator from 'validator';
import countryList from 'country-list';

import { UserRequest } from 'js/server/apply/router';
import fileUploadMiddleware from 'js/server/apply/file-upload';
import { HackerApplication } from 'js/server/models';
import { sendEmail } from 'js/server/email';
import * as emailTemplates from 'js/server/apply/email-templates';

// Optimise the list creation by only making it once, lazily.

function createCountryChoices(): { [id: string]: string }  {
  let choices = {};
    
  // Add an invalid placeholder so that the user doesn't accidentally miss this box.
  
  choices[''] = 'Choose a country…';
  
  // Add United Kingdom to the top of the country choices since it is the most likely to be applicable.
  
  choices['GB'] = 'United Kingdom';
  countryList().getData().forEach(({ code, name }) => {
    choices[code] = name;
  });
  return choices;
}

const countryChoices = createCountryChoices();

const schema: ValidationSchema = {
  /*cv: {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
    },
    custom: {
      errorMessage: 'You must upload your CV as a PDF.',
      options: (value) => {
        return value === value;
      },
    },
    custom: {
      errorMessage: 'The file must be less than 2MB in size.',
      options: (value) => {
        return value === value;
      },
    },
  },*/
  countryTravellingFrom: {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
    },
  },
  roles: {
    in: 'body',
    exists: true,
  },
  goals: {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
    },
  },
  interests: {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
    },
  },
  accomplishment: {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
    },
  },
  links: {
    in: 'body',
    exists: true,
    custom: {
      errorMessage: 'All the links must be valid.',
      options: (value) => {
        if (value === '') {
          return true;
        } else {
          return value.split(/\r?\n/).every((link) => {
            validator.isURL(link, {
              allow_underscores: true,
              protocols: ['http', 'https']
            })
          })
        }
      },
    },
  },
  teamMembership: {
    in: 'body',
    exists: true,
  },
  confirmations: {
    in: 'body',
    exists: true,
    custom: {
      errorMessage: 'You must confirm your student status, and accept the terms and conditions, privacy policy, and the MLH Code of Conduct.',
      options: (value) => {
        if (value === undefined) {
          return true;
        } else {
          return value.length === 2;
        }
      },
    },
  },
};

export function newHackerApplication(req, res, next) {
  res.render('apply/form.html', { countryChoices: countryChoices });
}

export const createHackerApplication = [
  fileUploadMiddleware.single('cv'),
  checkSchema(schema),
  (req: UserRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      res.render('apply/form.html', { errors: errors.array(), countryChoices: countryChoices });
    } else {
      createApplicationFromForm(req.body, req.user, req.file);
      res.redirect('dashboard.html');
    }
  }
]

export function createApplicationFromForm(body, user, file) {
  return generate().then(slug => {
    return HackerApplication.create({
      // Foreign key
      hackerId: user.id,
      // Application
      applicationSlug: slug,
      cv: file.location,
      countryTravellingFrom: body.countryTravellingFrom,
      developmentRoles: body.roles,
      learningGoal: body.goals,
      interests: body.interests,
      recentAccomplishment: body.accomplishment,
      links: body.links,
      inTeam: body.teamMembership.includes('teamMembership_apply'),
      wantsTeam: body.teamMembership.includes('teamMembership_placement'),
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
      return exports.createApplicationFromForm(body, user);
    } else {
      console.log('Failed to add an application to the database');
      return Promise.reject(err);
    }
    
  });
}
