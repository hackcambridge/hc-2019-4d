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
      const application = resultForm.data;
      application.cv = req.file;
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
          CV: application.cv.location,
          developmentRoles: JSON.stringify(application.development),
          learningGoal: application.learn,
          interests: application.interests,
          recentAccomplishment: application.accomplishment,
          links: application.links,
          inTeam: application.team_apply,
          wantsTeam: application.team_placement,
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

applyRouter.post('/team', auth.authenticate, applyFormUpload.none(), (req, res) => {
  const form = createTeamForm();

  form.handle(req.body, {
    success: (resultForm) => {
      // Store the team information in the database
      const application = resultForm.data;
      // Check the database for those application IDs
      const members = new Set(['<MY-APPLICATION-ID>']); // Start off with the current hacker's application ID — we already know they're in the team
      const hackerIDs = [];
      // Ensure application IDs are unique and not the applicant's own
      new Promise((resolve, reject) => {
        for (const applicationID of [application.memberB, application.memberC, application.memberD].map(s => s.trim()).filter(s => s !== '')) {
          if (!members.has(applicationID)) {
            members.add(applicationID);
          } else {
            throw new Error('Application IDs must be distinct.');
          }
        }
        resolve();
      }).then(() => {
        const applicationIDs = Array.from(members);
        if (applicationIDs.length > 1) {
          return Promise.all(applicationIDs.map(applicationID => {
            return database.HackerApplication.findOne({
              where: { applicationID }
            }).then(application => {
              if (application === null) {
                // The application ID was not valid
                throw new Error('The application ID matched no hacker.');
              }
              return application;
            }).then(application => {
              hackerIDs.push(application.hackerID);
              return database.TeamMember.findOne({
                where: { hackerID: application.hackerID }
              }).then(application => {
                if (application !== null) {
                  // The hacker is already part of another team
                  throw new Error('A team member can\'t belong to more than one team.');
                }
              });
            });
          }));
        } else {
          throw new Error('You need at least two team members to form a team.');
        }
      }).then(() => {
        // Create a new team
        database.Team.create({ }).then(team => {
          // Add the team members to the team
          for (const hackerID of hackerIDs) {
            database.TeamMember.create({
              teamID: team.id,
              hackerID
            });
          }
        });
        console.log('Team application success.');
        res.redirect('/apply/dashboard');
      }).catch(err => {
        console.log('Invalid team application:', err.message);
        renderTeamPageWithForm(res, form);
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