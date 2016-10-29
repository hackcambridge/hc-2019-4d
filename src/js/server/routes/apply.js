const express = require('express');
const createApplicationForm = require('js/shared/application-form');
const renderForm = require('js/shared/render-form');

const applyRouter = new express.Router();

applyRouter.get('/', (req, res) => {
  renderApplyPageWithForm(res, createApplicationForm());
});

applyRouter.post('/', (req, res) => {
  const form = createApplicationForm();

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