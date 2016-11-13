const express = require('express');
const { createApplicationForm, maxFieldSize } = require('js/shared/application-form');
const renderForm = require('js/shared/render-form');
var querystring = require('querystring');
var fetch = require('node-fetch');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
const auth = require('js/server/auth');
const email = require('js/server/email');
const utils = require('../utils.js');
const session = require('client-sessions');
const statuses = require('js/shared/status-constants');
const { Hacker } = require('js/server/models');
const { HackerApplication } = require('js/server/models');

// Set up the S3 connection
const s3 = new aws.S3(new aws.Config({
  region: 'eu-west-1'
}));
const applyFormUpload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, callback) {
      callback(null, crypto.randomBytes(256).toString('hex') + '.pdf');
    }
  }),
  limits: {
    fields: 20,
    fieldSize: maxFieldSize
  },
  fileFilter(req, file, callback) {
    // At this stage, we know we are only uploading a CV in PDF. Only accept PDFs
    if (file.mimetype === 'application/pdf') {
      callback(null, true);
    }

    callback(null, false);
  },
});

const applyRouter = new express.Router();

applyRouter.get('/', (req, res) => {
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

applyRouter.post('/form', applyFormUpload.single('cv'), (req, res, next) => {
  const form = createApplicationForm();

  // HACK: Put all our fields in the same place by moving the file into req.body
  req.body.cv = req.file;

  form.handle(req.body, {
    success: (resultForm) => {
      // Store the hacker information in the database
      const user = req.user;
      const form = resultForm.data;
      const applicationSlug = crypto.randomBytes(64).toString('hex');

      HackerApplication.create({
        // Foreign key
        hackerId: user.id,
        // Application
        applicationSlug,
        cv: form.cv.location,
        developmentRoles: form.development,
        learningGoal: form.learn,
        interests: form.interests,
        recentAccomplishment: form.accomplishment,
        links: form.links,
        inTeam: form.team_apply,
        wantsTeam: form.team_placement,
      }).then(application => {
        console.log(`An application was successfully made by ${user.firstName} ${user.lastName}.`);
        res.redirect(`${req.baseUrl}/form`);
      }).catch(err => {
        console.log('Failed to add an application to the database');
        next(err);
      });
    },
    error: (resultForm) => {
      renderApplyPageWithForm(res, resultForm);
    },
    empty: () => {
      renderApplyPageWithForm(res, form);
    }
  });
});

applyRouter.get('/dashboard', auth.requireAuth, function(req, res) {
  renderDashboard(req, res);
})

// The login page (has the login button)
applyRouter.get('/', function (req, res) {
  res.render('apply/index.html');
});

// Render the form for additional applicant details
applyRouter.get('/form', (req, res) => {
  renderApplyPageWithForm(res, createApplicationForm());
});

function renderDashboard(req, res) {
  const content = utils.loadResource('dashboard');

  req.user.getHackerApplication().then(hackerApplication => {
    const applicationStatus               = Promise.resolve(req.user.getApplicationStatus(hackerApplication));
    const teamApplicationStatusPromise    = req.user.getTeamApplicationStatus(hackerApplication);
    const furtherApplicationStatusPromise = req.user.getTeamApplicationStatus(hackerApplication);
    const responseStatusPromise           = req.user.getResponseStatus(hackerApplication);

    return Promise.all([
      applicationStatus,
      teamApplicationStatusPromise,
      furtherApplicationStatusPromise,
      responseStatusPromise,
    ]);
  }).then(values => {
    const applicationStatus        = values[0]
    const teamApplicationStatus    = values[1];
    const furtherApplicationStatus = values[2];
    const responseStatus           = values[3];

    const overallStatus = Hacker.deriveOverallStatus(
      applicationStatus,
      responseStatus,
      teamApplicationStatus,
      furtherApplicationStatus
    );

    res.render('apply/dashboard.html', {
      applicationStatus: applicationStatus,
      teamApplicationStatus: teamApplicationStatus,
      furtherApplicationStatus: furtherApplicationStatus,

      applicationInfo: content['your-application'][applicationStatus],
      teamApplicationInfo: content['team-application'][teamApplicationStatus],
      furtherApplicationInfo: content['further-application'][furtherApplicationStatus],
      statusMessage: content['status-messages'][overallStatus],
    });
  });
}

function renderApplyPageWithForm(res, form) {
  res.render('apply/form.html', {
    formHtml: form.toHTML(renderForm)
  });
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

module.exports = applyRouter;
