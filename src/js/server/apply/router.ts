import express = require('express');
const { createApplicationForm } = require('js/shared/application-form');
const { createTeamForm } = require('js/shared/team-form');
import auth = require('js/server/auth');
import renderForm = require('js/shared/render-form');
import renderTableForm = require('js/shared/render-table-form');
import statuses = require('js/shared/status-constants');
import Utils from '../utils';
const { Hacker, TeamMember } = require('js/server/models');
const { rsvpToResponse } = require('js/server/attendance/logic');
import fileUploadMiddleware from './file-upload';
import applyLogic = require('./logic');
const { getHackathonStartDate, getHackathonEndDate } = require('js/shared/dates');

const applyRouter = express.Router();
const utils = new Utils();

interface IAuthRequest extends express.Request {
  user?: any;
}

interface IUploadRequest extends IAuthRequest {
  file: any;
}

applyRouter.get('/', (req: IAuthRequest, res) => {
  if (req.user) {
    res.redirect(`${req.baseUrl}/dashboard`);
    return;
  }

  res.render('apply/index.html');
});

applyRouter.use(auth.requireAuth);

// Route to redirect to whatever next step is required
applyRouter.get('/', (req, res) => {
  res.redirect(`${req.baseUrl}/form`);
});

applyRouter.all('/form', checkHasApplied);
applyRouter.all('/form', checkApplicationsOpen);

applyRouter.post('/form', (req: IAuthRequest, res, next) => {
  req.user.log('Attempted to make an application');
  next();
},
fileUploadMiddleware.single('cv'),
(req: IUploadRequest, res, next) => {
  req.user.log('Application file uploaded');
  const form = createApplicationForm();

  // HACK: Put all our fields in the same place by moving the file into req.body
  req.body.cv = req.file;

  form.handle(req.body, {
    success: resultForm => {
      applyLogic.createApplicationFromForm(resultForm.data, req.user)
        .then(() => {
          res.redirect(`${req.baseUrl}/form`);
        })
        .catch(next);
    },
    error: resultForm => {
      renderApplyPageWithForm(res, resultForm);
    },
    empty: () => {
      renderApplyPageWithForm(res, form);
    }
  });
}
);

// Render the form for additional applicant details
applyRouter.get('/form', (req, res) => {
  renderApplyPageWithForm(res, createApplicationForm());
});

applyRouter.all('/team', checkApplicationsOpen);

applyRouter.post('/team', fileUploadMiddleware.none(), (req: AuthRequest, res, next) => {
  const form = createTeamForm();

  form.handle(req.body, {
    success: resultForm => {
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
    error: resultForm => {
      renderTeamPageWithForm(res, resultForm);
    },
    empty: () => {
      renderTeamPageWithForm(res, form);
    }
  });
});

// Process the RSVP response
applyRouter.post('/rsvp', auth.requireAuth, (req: AuthRequest, res) => {
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

applyRouter.get('/dashboard', auth.requireAuth, (req, res) => {
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
applyRouter.get('/team', (req: AuthRequest, res) => {
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

function renderDashboard(req, res) {
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
          where: {
            teamId,
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
      rsvpInfo: content.rsvp[rsvpStatus],
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
        field.errorHTML = () => `<p class="error_msg form-error-message">${errors[name]}</p>`;
      }
      return renderForm(name, field, options);
    })
  });
}

function renderPageWithTableForm(res, path, form, errors = { }) {
  res.render(path, {
    formHtml: form.toHTML((name, field, options = { }) => {
      if (errors.hasOwnProperty(name)) {
        field.errorHTML = () => `<p class="error_msg form-error-message">${errors[name]}</p>`;
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
  req.user.getHackerApplication().then(hackerApplication => {
    if (hackerApplication) {
      res.redirect(`${req.baseUrl}/dashboard`);
      return;
    }

    next();
  }).catch(next);
}

/**
 * Intercepts requests to check if applications are still open, redirecting to the dashbaord if not
 */
function checkApplicationsOpen(req, res, next) {
  console.log(process.env.APPLICATIONS_OPEN);
  if (process.env.APPLICATIONS_OPEN_STATUS === statuses.applicationsOpen.CLOSED) {
    res.redirect(`${req.baseUrl}/dashboard`);
    return;
  }

  next();
}

module.exports = applyRouter;
