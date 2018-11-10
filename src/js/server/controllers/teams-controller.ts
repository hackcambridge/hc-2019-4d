import { checkSchema, validationResult, ValidationSchema, Result } from 'express-validator/check';

import { UserRequest } from 'js/server/apply/router';
import { HackerApplication, ApplicationResponse, Team, TeamMember, HackerInstance } from 'js/server/models';
import { TeamMemberInstance } from '../models/TeamMember';
import { RequestHandlerParams } from '../../../../node_modules/@types/express-serve-static-core';

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

export async function newTeam(req: UserRequest, res): Promise<void> {
  const hackerApplication = await req.user.getHackerApplication();
  if (hackerApplication !== null) {
    const team = await req.user.getTeam();
    if (team === null) {
      res.render('apply/team.html', { applicationSlug: hackerApplication.applicationSlug });
    } else if (team !== null) {
      res.redirect('/apply/dashboard');
    }
  } else if (hackerApplication === null)  {
    res.redirect('/apply/form');
  }
}

export const createTeam: RequestHandlerParams[] = [
  checkSchema(schema),
  (req: UserRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('apply/team.html', {
        errors: errors.mapped(),
        formData: req.body,
      });
    } else {
      createTeamFromForm(req.body, req.user, errors).then(_ => {
        res.redirect('dashboard');
      }).catch(error => {
        res.render('apply/team.html', {
          formData: req.body,
          error: error,
        });
      });
    }
  }
];

export async function createTeamFromForm(body, user: HackerInstance, errors: Result<{}>): Promise<TeamMemberInstance[]> {
  const members = new Set<string>();
  const hackerIds = [user.id];
  const applicationSlugs = {
    'memberB': body.members.b,
    'memberC': body.members.c,
    'memberD': body.members.d,
  };
  // Ensure application slugs are unique and not the applicant's own
  const application = await user.getHackerApplication();
  // Start off with the current hacker's application slug — we already know they're in the team
  members.add(application.applicationSlug);

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

  if (members.size <= 1) {
    throw new Error(errors['memberB'] = 'You need at least two team members to form a team.');
  }

  await Promise.all(Object.keys(applicationSlugs).map(async field => {
    const applicationSlug = applicationSlugs[field];

    const application = await HackerApplication.findOne({
      where: { applicationSlug }
    });

    if (application === null) {
      // The application slug was not valid
      throw new Error(errors[field] = 'There aren\'t any applications with this ID!');
    }
    hackerIds.push(application.hackerId);

    const team = await TeamMember.findOne({
      where: { hackerId: application.hackerId }
    });

    if (team !== null) {
      // The hacker is already part of another team
      throw new Error(errors[field] = 'This applicant is already part of a different team!');
    }

    const applicationResponse = await ApplicationResponse.findOne({
      where: { hackerApplicationId: application.id }
    });

    if (applicationResponse !== null) {
      // The hacker has already been either accepted or rejected
      throw new Error(errors[field] = 'This applicant has already been reviewed.');
    }
  }));

  // Create a new team
  const team = await Team.create({ });

  // Add the team members to the team
  return Promise.all(hackerIds.map(hackerId =>
    TeamMember.create({
      teamId: team.id,
      hackerId
    })
  ));
}
