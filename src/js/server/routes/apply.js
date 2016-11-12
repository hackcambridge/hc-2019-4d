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
      form.cv = req.file;
      const applicationID = crypto.randomBytes(64).toString('hex');
      database.Hacker.create({
        // Personal
        firstName: user.first_name,
        lastName: user.last_name,
        gender: user.gender,
        dateOfBirth: user.date_of_birth,
        email: user.email,
        phoneNumber: user.phone_number,
        // Education
        institution: user.school.name,
        studyLevel: user.level_of_study,
        course: user.major,
        // Logistics
        shirtSize: user.shirt_size,
        dietaryRestrictions: user.dietary_restrictions,
        specialNeeds: user.special_needs,
      }).then(hacker => {
        database.HackerApplication.create({
          // Foreign key
          hackerID: hacker.id,
          // Application
          applicationID,
          CV: form.cv.location,
          developmentRoles: JSON.stringify(form.development),
          learningGoal: form.learn,
          interests: form.interests,
          recentAccomplishment: form.accomplishment,
          links: form.links,
          inTeam: form.team_apply,
          wantsTeam: form.team_placement,
        });
        console.log(`An application was successfully made by ${user.first_name} ${user.last_name}.`);
      }).catch(err => {
        console.log("Failed to add an application to the database:", err);
      });

      // email.sendEmail({
      //   to: user.email,
      //   contents: email.templates.applied({
      //     name: user.first_name,
      //     applicationId: applicationID,
      //   }),
      // });

      // redirect to the next page but for now...
      res.redirect('/apply/form');
    },
    error: (resultForm) => {
      renderApplyPageWithForm(res, resultForm);
    },
    empty: () => {
      renderApplyPageWithForm(res, form);
    }
  });
});

applyRouter.get('/dashboard', auth.authenticate, function(req, res) {
  renderDashboard(req, res);
})

// The login page (has the login button)
applyRouter.get('/', function (req, res) {
  res.render('apply/index.html');
});

// Render the form for additional applicant details
applyRouter.get('/form', auth.authenticate, function(req, res) {
  // TODO: If the user has already completed the form, redirect to dashboard
  renderApplyPageWithForm(res, createApplicationForm());
});

function renderDashboard(req, res) {
  // TODO: Get these dynamically from db
  const userHasApplied = true;
  const userAppliedWithTeam = false;
  const teamApplicationComplete = true;

  const reviewStatus = 'pending'; // 'pending', 'rejected' or 'accepted'
  const furtherDetailsComplete = false;

  // Derive the personal application status
  const yourApplicationStatus = userHasApplied ? 'complete' : 'incomplete';

  // Derive the team application status
  let teamApplicationStatus;
  if (!userAppliedWithTeam)
    teamApplicationStatus = 'na';
  else if (!teamApplicationComplete)
    teamApplicationStatus = 'incomplete';
  else
    teamApplicationStatus = 'complete';

  // Derive the further application status
  const furtherApplicationStatus = furtherDetailsComplete ? 'complete' : 'incomplete';

  // Derive the overall application status
  let overallStatus;
  if (!userHasApplied || userAppliedWithTeam && !teamApplicationComplete)
    overallStatus = 'incomplete';
  else if (reviewStatus == 'pending')
    overallStatus = 'in-review';
  else if (reviewStatus == 'rejected')
    overallStatus = 'rejected';
  else if (!furtherDetailsComplete)
    overallStatus = 'accepted-incomplete';
  else if (furtherDetailsComplete)
    overallStatus = 'accepted-complete';

  const content = utils.loadResource('dashboard');
  console.log(content);

  res.render('apply/dashboard.html', {
    applicationStatus: yourApplicationStatus,
    teamApplicationStatus: teamApplicationStatus,
    furtherApplicationStatus: furtherApplicationStatus,

    applicationInfo: content['your-application'][yourApplicationStatus],
    teamApplicationInfo: content['team-application'][teamApplicationStatus],
    furtherApplicationInfo: content['further-application'][furtherApplicationStatus],
    statusMessage: content['status-messages'][overallStatus],
  })

}

function renderApplyPageWithForm(res, form) {
  res.render('apply/form.html', {
    formHtml: form.toHTML(renderForm)
  });
}

module.exports = applyRouter;