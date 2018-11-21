import * as generateSlug from 'adjective-adjective-animal';
import { NextFunction, Response } from 'express';
import { RequestHandlerParams } from 'express-serve-static-core';
import { checkSchema, validationResult, ValidationSchema } from 'express-validator/check';
import * as validator from 'validator';
import countryList from 'country-list';

import { UserRequest } from 'js/server/routes/apply-router';
import { s3Upload } from 'js/server/apply/file-upload';
import { HackerApplication, HackerInstance, HackerApplicationInstance } from 'js/server/models';
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
  cv: {
    in: 'params',
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'Select a file',
    },
    custom: {
      options: (value, { req }) => {
        if (value.error) {
          throw value.error;
        } else if (!req.file) {
          throw new Error('File not selected.');
        } else {
          return true;
        }
      }
    }
  },
  countryTravellingFrom: {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'Fill out this field',
    },
  },
  goals: {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'Fill out this field',
    },
  },
  interests: {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'Fill out this field',
    },
  },
  accomplishment: {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'Fill out this field',
    },
  },
  links: {
    in: 'body',
    exists: true,
    custom: {
      errorMessage: 'All the links must be valid.',
      options: value => {
        if (value === '') {
          return true;
        } else {
          return value.split(/\r?\n/).every(link =>
            validator.isURL(link, {
              allow_underscores: true,
              protocols: ['http', 'https']
            })
          )
        }
      },
    },
  },
  teamMembership: {
    in: 'body',
    exists: {
      errorMessage: 'Select this tickbox',
    },
  },
  confirmations: {
    in: 'body',
    exists: true,
    custom: {
      errorMessage: 'You must confirm your student status, and accept the terms and conditions, privacy policy, and the MLH Code of Conduct.',
      options: value => {
        if (value === undefined) {
          return true;
        } else {
          return value.includes('studentStatus') && value.includes('termsAndConditions');
        }
      },
    },
  },
  graduationMonth: {
    in: 'body',
    exists: true,
    isISO8601: {
      errorMessage: 'Invalid date',
      options: {
        strict: true,
      },
    },
  },
  visaNeededBy: {
    in: 'body',
    optional: {
      nullable: true,
      checkFalsy: true,
    },
    custom: {
      errorMessage: 'Invalid date',
      options: value => {
        if (value == '') {
          return true;
        } else {
          return validator.isISO8601(value);
        }
      },
    },
  },
};

const cvUpload = s3Upload({
  maxFields: 30,
  maxFileSize: 1024 * 1024 * 2,
  mediaType: {
    type: 'application/pdf',
    error: 'File is not a PDF.',
  },
  missing: {
    error: 'File is missing.'
  },
}).single('cv');

export function newHackerApplication(req: UserRequest, res: Response) {
  res.render('apply/application-form', { countryChoices: countryChoices });
}

export const createHackerApplication: RequestHandlerParams = [
  (req: UserRequest, res: Response, next: NextFunction) => {
    cvUpload(req, res, err => {
      req.params.cv = err ? { error: err } : true;
      next();
    });
  },
  ...checkSchema(schema),
  (req: UserRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('apply/application-form', {
        errors: errors.mapped(),
        countryChoices: countryChoices,
        formData: req.body,
      });
    } else {
      createApplicationFromForm(req.body, req.user, req.file).then(application => {
        res.redirect(application.inTeam ? 'team' : 'dashboard');
      }).catch(error => {
        res.render('apply/application-form', {
          formData: req.body,
          error: error,
          countryChoices: countryChoices,
        });
      })
    }
  }
];

async function createApplicationFromForm(body, user: HackerInstance, file): Promise<HackerApplicationInstance> {
  const applicationSlug: string = await generateSlug();
  try {
    const application = await HackerApplication.create({
      // Foreign key
      hackerId: user.id,
      // Application
      applicationSlug,
      cv: file ? file.location : null,
      countryTravellingFrom: body.countryTravellingFrom,
      developmentRoles: body.roles || [],
      learningGoal: body.goals,
      interests: body.interests,
      recentAccomplishment: body.accomplishment,
      links: body.links,
      inTeam: body.teamMembership.includes('apply'),
      wantsTeam: body.teamMembership.includes('placement'),
      needsVisa: Boolean(body.needsVisaBy),
      visaNeededBy: body.visaNeededBy || null,
      wantsMailingList: Boolean(body.wantsMailingList),
      graduationDate: body.graduationMonth,
      otherInfo: body.otherInfo || null,
    });

    await sendEmail({
      to: user.email, 
      contents: emailTemplates.applied({
        name: user.firstName,
        applicationSlug: application.applicationSlug,
        inTeam: application.inTeam,
      }),
    });

    console.log('Application made successfully');

    return application;
  } catch (err) {
    if (err.name == 'SequelizeUniqueConstraintError' && err.errors[0].path === 'applicationSlug') {
      // slug was not unique, try again with new slug
      console.error('Application slug collision detected');
      return createApplicationFromForm(body, user, file);
    } else {
      console.error('Failed to add an application to the database');
      return Promise.reject(err);
    }
  }
}
