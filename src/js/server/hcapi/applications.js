const { Router } = require('express');
const { Hacker, HackerApplication } = require('js/server/models');
const { createHttpError } = require('./errors');

const applicationsRouter = new Router();

applicationsRouter.get('/', (req, res, next) => {
  HackerApplication
    .findAll({
      include: [
        {
          model: Hacker,
          required: true,
        },
      ],
    })
    .then(applications => Promise.all(applications.map(appl => appl.hacker.getResponseStatus(appl).then(responseStatus => ({
      id: appl.id,
      name: `${appl.hacker.firstName} ${appl.hacker.lastName}`,
      gender: appl.hacker.gender,
      country: appl.countryTravellingFrom,
      inTeam: appl.inTeam,
      rating: 0, // Temporary — will be replaced with actual score soon
      status: responseStatus.substr(0, 1).toUpperCase() + responseStatus.substr(1)
    })))))
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

module.exports = applicationsRouter;
