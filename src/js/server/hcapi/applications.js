const { Router } = require('express');
const Sequelize = require('sequelize');
const { Hacker, HackerApplication, ApplicationResponse, TeamMember, Team, db } = require('js/server/models');
const { createHttpError } = require('./errors');
const fs = require('fs');
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

module.exports = applicationsRouter;
