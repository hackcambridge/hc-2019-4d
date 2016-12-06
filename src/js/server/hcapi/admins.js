const { Router } = require('express');
const { Admin } = require('js/server/models');
const { createHttpError } = require('./errors');

const adminsRouter = new Router();

adminsRouter.get('/:adminId/next-review-application', (req, res, next) => {
  Admin
    .findById(req.params.adminId)
    .then((admin) => {
      if (!admin) {
        next();
        return;
      }

      return admin
        .getNextApplicationToReview()
        .then((application) => {
          if (!application) {
            res.json({ applicationId: null });
          } else {
            res.json({ applicationId: application.id });
          }
        });
    })
    .catch(next);
});

module.exports = adminsRouter;
