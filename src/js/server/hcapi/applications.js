const { Router } = require('express');
const { Hacker, HackerApplication } = require('js/server/models');
const { createHttpError } = require('./errors');

const applicationsRouter = new Router();

applicationsRouter.get('/:applicationId', (req, res, next) => {
  HackerApplication
    .findOne({
      where: {
        id: req.params.applicationId,
      },
      include: [
        {
          model: Hacker,
          required: true,
        },
      ],
    })
    .then((application) => {
      if (!application) {
        next();
        return;
      }

      res.json({
        application,
      });
    })
    .catch(next);
});

module.exports = applicationsRouter;
