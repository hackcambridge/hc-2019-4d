const express = require('express');
const { createApplicationForm, maxFieldSize } = require('js/shared/application-form');
const renderForm = require('js/shared/render-form');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
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
    fieldSize: maxFieldSize,
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
  renderApplyPageWithForm(res, createApplicationForm());
});

applyRouter.post('/', applyFormUpload.single('cv'), (req, res) => {
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
      res.redirect('/');
    },
    error: (resultForm) => {
      renderApplyPageWithForm(res, resultForm);
    },
    empty: () => {
      renderApplyPageWithForm(res, form);
    }
  });
});

function renderApplyPageWithForm(res, form) {
  res.render('apply.html', {
    formHtml: form.toHTML(renderForm),
  });
}

module.exports = applyRouter;