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
      // email.sendEmail({
      //   to: 'applicant@hackcambridge.com',
      //   contents: email.templates.applied({
      //     name: 'John',
      //     applicationId: '100012',
      //   }),
      // });

      // Log form data to pretend we're doing something useful
      console.log(resultForm.data);

      // redirect to the next page but for now...
      res.redirect('/form');
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
  res.render('apply/dashboard.html');
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

function renderApplyPageWithForm(res, form) {
  res.render('apply/form.html', {
    formHtml: form.toHTML(renderForm)
  });
}

module.exports = applyRouter;