const express = require('express');
const { createApplicationForm } = require('js/shared/application-form');
const renderForm = require('js/shared/render-form');
const auth = require('js/server/auth');
const email = require('js/server/email');
const session = require('client-sessions');
const applyLogic = require('./logic');
const fileUploadMiddleware = require('./file-upload');

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

applyRouter.get('/dashboard', (req, res) => {
  res.end('Hey there :3');
});

applyRouter.all('/form', checkHasApplied);

applyRouter.post('/form', fileUploadMiddleware, (req, res, next) => {
  const form = createApplicationForm();

  // HACK: Put all our fields in the same place by moving the file into req.body
  req.body.cv = req.file;

  form.handle(req.body, {
    success: (resultForm) => {
      applyLogic.createApplicationFromForm(resultForm.data, req.user)
        .then(() => {
          res.redirect(`${req.baseUrl}/form`);
        })
        .catch(next);
    },
    error: (resultForm) => {
      renderApplyPageWithForm(res, resultForm);
    },
    empty: () => {
      renderApplyPageWithForm(res, form);
    }
  });
});

// Render the form for additional applicant details
applyRouter.get('/form', (req, res) => {
  renderApplyPageWithForm(res, createApplicationForm());
});

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
