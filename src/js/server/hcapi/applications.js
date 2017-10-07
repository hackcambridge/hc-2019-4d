const { Router } = require('express');
const responseLogic = require('js/server/review/response-logic');
const { Hacker, HackerApplication } = require('js/server/models');
const { getApplicationsWithScores } = require('js/server/review/score-logic');

const applicationsRouter = new Router();

applicationsRouter.get('/', (req, res, next) => {
  getApplicationsWithScores().then(applications => {
    res.json({
      applications,
    });
  }).catch(next);
});

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

/**
 * Sets a response for an individual application. Expects a response type in its body:
 * 
 * ```
 * {
 *   "response": "invited"
 * }
 * ```
 */
applicationsRouter.post('/:applicationId/response', (req, res, next) => {
  HackerApplication.findOne({
    where: {
      id: req.params.applicationId,
    },
  }).then((application) => {
    if (!application) {
      next();
      return;
    }

    return responseLogic
      .setResponseForApplicationWithChecks(application, req.body.response)
      .then((applicationResponse) => {
        res.json(applicationResponse);
      });
  }).catch(next);
});

module.exports = applicationsRouter;
