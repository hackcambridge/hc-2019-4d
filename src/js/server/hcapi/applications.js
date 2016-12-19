const { Router } = require('express');
const { Hacker, HackerApplication, ApplicationResponse } = require('js/server/models');
const { createHttpError } = require('./errors');
const responseLogic = require('js/server/review/response-logic');

const applicationsRouter = new Router();

applicationsRouter.get('/', (req, res, next) => {
  HackerApplication
    .findAll({
      include: [
        {
          model: Hacker,
          required: true,
        },
        {
          model: ApplicationResponse,
          required: false,
        },
      ],
    })
    .then(applications => applications.map(appl => ({
      id: appl.id,
      name: `${appl.hacker.firstName} ${appl.hacker.lastName}`,
      gender: appl.hacker.gender,
      country: appl.countryTravellingFrom,
      inTeam: appl.inTeam,
      rating: 0, // Temporary — will be replaced with actual score soon
      status: appl.applicationResponse !== null ? (appl.applicationResponse === 'invited' ? 'Invited' : 'Not Invited') : 'Pending'
    })))
    .then(applications => {
      res.json({
        applications,
      });
    })
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
