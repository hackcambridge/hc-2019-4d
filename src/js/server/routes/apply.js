const express = require('express');
const { createApplicationForm, maxFieldSize } = require('js/shared/application-form');
const renderForm = require('js/shared/render-form');
const multer = require('multer');
const crypto = require('crypto');

const applyFormUpload = multer({
  // storage: s3?
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
    success: () => {
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