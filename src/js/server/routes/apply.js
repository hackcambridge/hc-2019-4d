const express = require('express');
const { createApplicationForm, maxFieldSize } = require('js/shared/application-form');
const { createTeamForm } = require('js/shared/team-form');
const renderForm = require('js/shared/render-form');
var querystring = require('querystring');
var fetch = require('node-fetch');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
const auth = require('js/server/auth');
const email = require('js/server/email');
const session = require('client-sessions');
const database = require('js/server/database');

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

applyRouter.post('/form', auth.authenticate, applyFormUpload.single('cv'), (req, res) => {
  const form = createApplicationForm();

  // HACK: Put all our fields in the same place by moving the file into req.body
  req.body.cv = req.file;

  form.handle(req.body, {
    success: (resultForm) => {
      // Store the hacker information in the database
      const user = res.locals.user;
      const form = resultForm.data;
      const applicationID = crypto.randomBytes(64).toString('hex');
      database.Hacker.create({
        firstName: user.first_name,
        lastName: user.last_name,
        applicationID,
        email: user.email,
        phoneNumber: user.phone_number,
        inTeam: form.team_apply,
        wantsTeam: form.team_placement,
      });

      // email.sendEmail({
      //   to: user.email,
      //   contents: email.templates.applied({
      //     name: user.first_name,
      //     applicationId: applicationID,
      //   }),
      // });

      if (form.team_apply) {
        res.redirect('/apply/team');
      } else {
        res.redirect('/apply/dashboard');
      }
    },
    error: (resultForm) => {
      renderApplyPageWithForm(res, resultForm);
    },
    empty: () => {
      renderApplyPageWithForm(res, form);
    }
  });
});

applyRouter.post('/team', auth.authenticate, (req, res) => {
  const form = createTeamForm();

  form.handle(req.body, {
    success: (resultForm) => {
      console.log("Team application success.");
      res.redirect('/apply/dashboard');
    },
    error: (resultForm) => {
      console.log("error");
      renderTeamPageWithForm(res, resultForm);
    },
    empty: () => {
      console.log("empty");
      renderTeamPageWithForm(res, form);
    }
  });
});

// The main apply page (has the login button)
applyRouter.get('/', function (req, res) {
  res.render('apply/index.html');
});

// Render the form for additional applicant details
applyRouter.get('/form', auth.authenticate, function(req, res) {
  renderApplyPageWithForm(res, createApplicationForm());
});

// Render the team formation form
applyRouter.get('/team', auth.authenticate, function(req, res) {
  renderTeamPageWithForm(res, createTeamForm());
});

function renderPageWithForm(res, path, form) {
  res.render(path, {
    formHtml: form.toHTML(renderForm)
  });
}

function renderApplyPageWithForm(res, form) {
  renderPageWithForm(res, 'apply/form.html', form);
};

function renderTeamPageWithForm(res, form) {
  renderPageWithForm(res, 'apply/team.html', form);
};

module.exports = applyRouter;