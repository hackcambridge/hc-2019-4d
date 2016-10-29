const express = require('express');
const createApplicationForm = require('js/shared/application-form');

const applyRouter = new express.Router();

applyRouter.get('/', (req, res) => {
  res.render('apply.html', {
    formHtml: createApplicationForm().toHTML(),
  });
});

module.exports = applyRouter;