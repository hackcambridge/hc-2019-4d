const { Router } = require('express');
const Sequelize = require('sequelize');
const { Hacker, HackerApplication, ApplicationResponse, TeamMember, Team, db } = require('js/server/models');
const { createHttpError } = require('./errors');
const responseLogic = require('js/server/review/response-logic');
const fs = require('fs');
const individualScoreQuery = fs.readFileSync('src/js/server/hcapi/queries/indiv_score_unteamed.sql', 'utf8');

const applicationsRouter = new Router();

// Takes an application and the set of all individual scores and
// the set of teams average scores
// returns the score for that application as a float
function calculateScore(application, individualScores, teamScores) {
  let hacker = application.hacker;
  let teamId = hacker.Team ? hacker.Team.teamId : null;

  if (teamId == null) {
    // The hacker isn't in a team
    if (application.inTeam) {
      // If they applied as a team then their application is incomplete, return null
      return null
    } else {
      // return the individual average score if it exists, null otherwise
      let score = individualScores[application.id];
      return score ? score : null;
    }
  } else {
    // The hacker is in a team 
    let teamScore = teamScores[teamId];
    if (teamScore === undefined) {
      // Something went wrong, couldn't find the hackers team
      console.log(`Error: Could not find score for team ${teamId}`);
    } else {
      return teamScore; // This may be null
    }
  }
}

// Takes a team (including teamMembers) and calculates the team average score
// This is null if any of the team members are unscored
function calculateTeamAverage(team, individualScores) {
  let teamMembers = team.teamMembers;
  let teamMembersScores = teamMembers.map((member) => {
    let memberApplicationId = member.hacker.hackerApplication.id;
    let score = individualScores[memberApplicationId];
    return score ? score : null;
  });
  // Check that all the teamMembers have been scored
  // Return the average of those scores
  return averageOrNull(teamMembersScores);
}

// Takes a list of numbers and returns the average or null if any one of them is null
function averageOrNull(values) {
  let sum = 0;
  let length = values.length;
  for (var i = 0; i < length; i++) {
    if (values[i] === null) { return null }
    sum += values[i];
  }
  return sum / length;
}

applicationsRouter.get('/', (req, res, next) => {

  // Get the applications
  let applicationsPromise = HackerApplication.findAll({
    include: [
      {
        model: Hacker,
        required: true,
        include: [
          {
            model: TeamMember,
            as: 'Team',
            required: false,
          },
        ],
      },
      {
        model: ApplicationResponse,
        required: false,
      },
    ],
  });

  // Get the individual scores (exist if reviews have been done)
  let individualScoresPromise = db.query(individualScoreQuery, {
    type: Sequelize.QueryTypes.SELECT,
  });

  // Get the teams with members listed
  let teamsPromise = Team.findAll({
    include: [
      {
        model: TeamMember,
        required: true,
        include: [
          {
            model: Hacker,
            include: [HackerApplication],
          },
        ],
      }
    ]
  });

  Promise.all([
    applicationsPromise,
    individualScoresPromise,
    teamsPromise,
  ]).then(([applications, individualScoresArr, teamsArr]) => {
   
    /**
     * Flatten the scores array for later efficiency
     * [
     *   {application_id: 1, avg: 2.5},
     *   {application_id: 2, avg: 3.5},
     * ]
     *
     * is flattened to:
     *
     * {
     *   '1': 2.5,
     *   '2': 3.5,
     * }
     */
    const individualScores = individualScoresArr.reduce((a, b) => Object.assign(a, {[b.application_id]: parseFloat(b.avg)}), {});

    /**
     * Flatten teams array for later efficiency
     * [
     *   {id: 1, ...},
     *   {id: 2, ...},
     * ]
     *
     * is flattened to:
     *
     * {
     *   '1': {id: 1, ...},
     *   '2': {id: 2, ...},
     * }
     */
    const teamScores = teamsArr.reduce((teams, team) => Object.assign(teams, {[team.id]: calculateTeamAverage(team, individualScores)}), {});

    return applications.map(application => ({
      id: application.id,
      name: `${application.hacker.firstName} ${application.hacker.lastName}`,
      gender: application.hacker.gender,
      country: application.countryTravellingFrom,
      inTeam: application.hacker.Team !== undefined || applciation.inTeam,
      rating: calculateScore(application, individualScores, teamScores),
      status: application.applicationResponse !== null ? (application.applicationResponse === 'invited' ? 'Invited' : 'Not Invited') : 'Pending',
    }))
  })
  .then(applications => {
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
