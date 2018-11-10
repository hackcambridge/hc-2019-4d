import { Router, Request } from 'express';
import * as tag from 'forms/lib/tag';

import * as hackerApplicationsController from 'js/server/controllers/hacker-applications-controller';
import { createApplicationForm } from 'js/shared/apply/application-form';
import { createTeamForm } from 'js/shared/apply/team-form';
import renderForm from 'js/shared/apply/render-form';
import renderTableForm from 'js/shared/apply/render-table-form';
import * as auth from 'js/server/auth';
import * as utils from '../utils.js';
import * as statuses from 'js/shared/status-constants';
import { Hacker, TeamMember, HackerApplication } from 'js/server/models';
import { rsvpToResponse } from 'js/server/attendance/logic';
import * as applyLogic from './logic';
import fileUploadMiddleware from './file-upload';
import { getHackathonStartDate, getHackathonEndDate } from 'js/shared/dates';
import { HackerInstance } from '../models/Hacker.js';
import { HackerApplicationInstance } from '../models/HackerApplication';

const applyRouter = Router();

export interface UserRequest extends Request {
  user: HackerInstance;
}

applyRouter.get('/', (req: UserRequest, res) => {
  req.user ? res.redirect(`${req.baseUrl}/dashboard`) : res.render('apply/index.html');
});

applyRouter.use(auth.requireAuth);

// Route to redirect to whatever next step is required
applyRouter.get('/', (req, res) => {
  res.redirect(`${req.baseUrl}/form`);
});

applyRouter.all('/form', checkHasApplied);
applyRouter.all('/form', checkApplicationsOpen);
applyRouter.get('/form', hackerApplicationsController.newHackerApplication);
applyRouter.post('/form', hackerApplicationsController.createHackerApplication);

applyRouter.all('/team', checkApplicationsOpen);

applyRouter.post('/team', (req: UserRequest, res, next) => {
  const form = createTeamForm();

  form.handle(req.body, {
    success: (resultForm: any) => {
      const errors = { };
      applyLogic.createTeamFromForm(resultForm.data, req.user, errors).then(() => {
        console.log('Team application success.');
        res.redirect('/apply/dashboard');
      }).catch(err => {
        console.log('Invalid team application:', err.message);
        req.user.getHackerApplication().then(hackerApplication => {
          res.locals.applicationSlug = hackerApplication.applicationSlug;
          renderTeamPageWithForm(res, createTeamForm(resultForm.data), errors);
        });
      });
    },
    error: (resultForm) => {
      renderTeamPageWithForm(res, resultForm);
    },
    empty: () => {
      renderTeamPageWithForm(res, form);
    }
  });
});

// Process the RSVP response
applyRouter.post('/rsvp', auth.requireAuth, (req: UserRequest, res) => {
  const rsvp = req.body.rsvp;
  if (rsvp) {
    // RSVP was given, store it
    req.user.getHackerApplication().then(hackerApplication => {

      if (hackerApplication == null) {
        return Promise.resolve(null);
      } else {
        return hackerApplication.getApplicationResponse();
      }

    }).then(applicationResponse => {

      if (applicationResponse != null) {
        // Found a response
        return applicationResponse.getResponseRsvp().then(responseRsvp => {
          if (responseRsvp != null) {
            console.log('There was already an RSVP for this application, ignoring new');
            return Promise.resolve(null);
          } else {
            return rsvpToResponse(applicationResponse, rsvp);
          }
        });
      } else {
        // No response found
        return Promise.resolve(null);
      }

    }).then(() => {
      res.redirect('/apply/dashboard');
    });
  } else {
    // No RSVP given so just redirect
    res.redirect('/apply/dashboard');
  }
});

applyRouter.get('/dashboard', auth.requireAuth, (req: UserRequest, res) => {
  renderDashboard(req, res);
});

applyRouter.get('/logout', auth.logout, (req, res) => {
  res.redirect('/');
});

// The login page (has the login button)
applyRouter.get('/', (req, res) => {
  res.render('apply/index.html');
});

// Render the form for team applications
applyRouter.get('/team', (req: UserRequest, res) => {
  req.user.getHackerApplication().then(hackerApplication => {
    if (hackerApplication !== null) {
      req.user.getTeam().then(team => {
        if (team === null) {
          res.locals.applicationSlug = hackerApplication.applicationSlug;
          renderTeamPageWithForm(res, createTeamForm());
        } else {
          // User already in a team
          res.redirect('/apply/dashboard');
        }
      });
    } else {
      res.redirect('/apply/form');
    }
  });
});

function renderDashboard(req: UserRequest, res) {
  const content = utils.loadResource('dashboard');
  let application;
  let applicationStatus;

  req.user.getHackerApplication().then(hackerApplication => {
    application       = hackerApplication;
    applicationStatus = req.user.getApplicationStatus(hackerApplication);

    const teamApplicationStatusPromise    = req.user.getTeamApplicationStatus(hackerApplication);
    const responseStatusPromise           = req.user.getResponseStatus(hackerApplication);
    const rsvpStatusPromise               = req.user.getRsvpStatus(hackerApplication);
    const ticketStatusPromise             = req.user.getTicketStatus(hackerApplication);

    const teamMembersPromise = req.user.getTeam().then(teamMember => {
      if (teamMember === null) {
        return null;
      } else {
        const teamId = teamMember.teamId;
        return TeamMember.findAll({
          where: <any>{
            teamId: teamId,
            $not: {
              // Exclude the current user
              hackerId: req.user.id,
            }
          },
        });
      }
    }).then(teamMembers => {
      if (teamMembers == null) {
        return null;
      }
      return Promise.all(
        teamMembers.map(member => member.getHacker())
      );
    });

    return Promise.all([
      teamApplicationStatusPromise,
      responseStatusPromise,
      rsvpStatusPromise,
      teamMembersPromise,
      ticketStatusPromise,
    ]);
  }).then(([teamApplicationStatus, responseStatus, rsvpStatus, teamMembers, ticketStatus]) => {
    const overallStatus = Hacker.deriveOverallStatus(
      applicationStatus,
      responseStatus,
      teamApplicationStatus,
      rsvpStatus,
      ticketStatus
    );

    const fridayWeekday = 5;
    const fridayBeforeHackathonDate = (getHackathonStartDate().isoWeekday() > fridayWeekday) ? getHackathonStartDate().isoWeekday(fridayWeekday) : getHackathonStartDate().subtract(1, 'week').isoWeekday(fridayWeekday);

    res.render('apply/dashboard.html', {
      applicationSlug: (application === null) ? null : application.applicationSlug,
      applicationStatus,
      wantsTeam: (application === null) ? null : application.wantsTeam,
      teamApplicationStatus,
      responseStatus,
      rsvpStatus,
      ticketStatus,
      overallStatus,

      applicationInfo: content['your-application'][applicationStatus],
      teamApplicationInfo: content['team-application'][teamApplicationStatus],
      rsvpInfo: content['rsvp'][rsvpStatus],
      statusMessage: content['status-messages'][overallStatus],
      teamMembers,

      applicationsOpenStatus: process.env.APPLICATIONS_OPEN_STATUS,

      hackathonStartDate: getHackathonStartDate().format('dddd DDDo MMM YYYY'),
      hackathonEndDate: getHackathonEndDate().format('dddd DDDo MMM'),
      fridayBeforeHackathonDate: fridayBeforeHackathonDate.format('DDDo MMM'),

      statuses,
    });
  });
}

function renderPageWithForm(res, path, form, errors = { }) {
  res.render(path, {
    formHtml: form.toHTML((name, field, options = { }) => {
      if (errors.hasOwnProperty(name)) {
        field.errorHTML = () => tag('p', { classes: ['error_msg form-error-message'] }, errors[name]);
      }
      return renderForm(name, field, options);
    })
  });
}

function renderPageWithTableForm(res, path, form, errors = { }) {
  res.render(path, {
    formHtml: form.toHTML((name, field, options = { }) => {
      if (errors.hasOwnProperty(name)) {
        field.errorHTML = () => tag('td', { classes: ['error_msg form-error-message'] }, errors[name]);
      }
      return renderTableForm(name, field, options);
    })
  });
}

function renderApplyPageWithForm(res, form, errors = { }) {
  renderPageWithForm(res, 'apply/form.html', form, errors);
}

function renderTeamPageWithForm(res, form, errors = { }) {
  renderPageWithTableForm(res, 'apply/team.html', form, errors);
}

/**
 * Intercepts the request to check if the user has submitted an application
 * 
 * If they have, it will redirect them to the dashboard. Otherwise, it will let them proceed
 * as normal.
 */
function checkHasApplied(req, res, next) {
  req.user.getHackerApplication().then((hackerApplication: HackerApplicationInstance) => {
    if (hackerApplication) {
      //If the hacker wants to create a team, redirect to the team page otherwise send them to the dashboard
      if (hackerApplication.inTeam) {
        res.redirect(`${req.baseUrl}/team`);
        return;
      }
      res.redirect(`${req.baseUrl}/dashboard`);
      return;
    } 

    next();
  }).catch(next);
}

/**
 * Intercepts requests to check if applications are still open, redirecting to the dashboard if not
 */
function checkApplicationsOpen(req, res, next) {
  console.log(process.env.APPLICATIONS_OPEN);
  if (process.env.APPLICATIONS_OPEN_STATUS === statuses.applicationsOpen.CLOSED) {
    res.redirect(`${req.baseUrl}/dashboard`);
    return;
  }
  
  next();
}

export default applyRouter;
