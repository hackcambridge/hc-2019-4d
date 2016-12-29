const { Router } = require('express');
const { createHttpError } = require('./errors');
const responseLogic = require('js/server/review/response-logic');
const { Hacker, HackerApplication, Team } = require('js/server/models');
const { 
  getApplicationsWithTeams,
  getIndividualScores,
  getTeamsWithMembers,
  calculateScore,
  calculateTeamAverage,
  calculateTeamsAverages,
} = require('js/server/review/score-logic');

const applicationsRouter = new Router();

applicationsRouter.get('/', (req, res, next) => {
  Promise.all([
    getApplicationsWithTeams(),
    getIndividualScores(),
    getTeamsWithMembers(),
  ]).then(([applications, individualScores, teamsArr]) => {
    const teamScores = calculateTeamsAverages(individualScores, teamsArr);

    return applications.map(application => ({
      id: application.id,
      name: `${application.hacker.firstName} ${application.hacker.lastName}`,
      gender: application.hacker.gender,
      institution: application.hacker.institution,
      country: application.countryTravellingFrom,
      inTeam: application.hacker.Team !== null || application.inTeam,
      rating: calculateScore(application, individualScores, teamScores),
      status: application.applicationResponse !== null ? (application.applicationResponse === 'invited' ? 'Invited' : 'Not Invited') : 'Pending',
    }))

  }).then(applications => {
    res.json({
      applications,
    });
  }).catch(next)
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
