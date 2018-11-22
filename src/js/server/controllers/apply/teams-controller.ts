import { NextFunction, Response } from 'express';
import { RequestHandlerParams } from 'express-serve-static-core';
import { checkSchema, validationResult, ValidationSchema } from 'express-validator/check';

import { ApplicationResponse, HackerApplication, HackerInstance, Team, TeamMember, TeamMemberInstance } from 'js/server/models';
import { UserRequest } from 'js/server/routes/apply-router';

const schema: ValidationSchema = {
  'members.b': {
    in: 'body',
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'Fill out this field',
    },
  },
};

export async function newTeam(req: UserRequest, res): Promise<void> {
  const hackerApplication = await req.user.getHackerApplication();
  if (hackerApplication !== null) {
    const team = await req.user.getTeam();
    if (team === null) {
      res.render('apply/team-form', { applicationSlug: hackerApplication.applicationSlug });
    } else {
      res.redirect('/apply/dashboard');
    }
  } else {
    res.redirect('/apply/application-form');
  }
}

export const createTeam: RequestHandlerParams = [
  ...checkSchema(schema),
  (req: UserRequest, res: Response, _next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('apply/team-form', {
        errors: errors.mapped(),
        formData: req.body,
      });
    } else {
      createTeamFromForm(req.body, req.user, errors).then(_ => {
        res.redirect('/apply/dashboard');
      }).catch(error => {
        res.render('apply/team-form', {
          formData: req.body,
          error,
        });
      });
    }
  }
];

export async function createTeamFromForm(body, user: HackerInstance, errors): Promise<TeamMemberInstance[]> {
  const members = new Set<string>();
  const hackerIds = [user.id];
  const applicationSlugs = {
    memberB: body.members.b,
    memberC: body.members.c || null,
    memberD: body.members.d || null,
  };
  // Ensure application slugs are unique and not the applicant's own
  const application = await user.getHackerApplication();
  // Start off with the current hacker's application slug — we already know they're in the team
  members.add(application.applicationSlug);

  for (const field in applicationSlugs) {
    if (applicationSlugs[field] !== null) {
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
    throw new Error(errors.memberB = 'You need at least two team members to form a team.');
  }

  await Promise.all(Object.keys(applicationSlugs).map(async field => {
    const applicationSlug = applicationSlugs[field];

    const teamMemberApplication = await HackerApplication.findOne({
      where: { applicationSlug }
    });

    if (teamMemberApplication === null) {
      // The application slug was not valid
      throw new Error(errors[field] = 'There aren\'t any applications with this ID!');
    }
    hackerIds.push(teamMemberApplication.hackerId);

    const existingTeam = await TeamMember.findOne({
      where: { hackerId: teamMemberApplication.hackerId }
    });

    if (existingTeam !== null) {
      // The hacker is already part of another team
      throw new Error(errors[field] = 'This applicant is already part of a different team!');
    }

    const applicationResponse = await ApplicationResponse.findOne({
      where: { hackerApplicationId: teamMemberApplication.id }
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
