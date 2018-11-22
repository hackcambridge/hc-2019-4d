import * as fs from 'fs';
import * as Sequelize from 'sequelize';

import { ApplicationResponse, ApplicationReview, db, Hacker, HackerApplication, Team, TeamMember } from 'js/server/models';

const individualScoreQuery = fs.readFileSync('src/js/server/review/individual_scores.sql', 'utf8');

/**
 * Takes a HackerApplication and the set of individual scores,
 * produces the validated, group averaged (if necessary) score
 * for that application
 *
 * Returns null if they are not 'fully scored', i.e. they are yet to recieve at least two reviews.
 *
 * @param  {HackerApplication} application  The HackerApplication of the person to score
 * @param  {Object} individualScores        The object mapping HackerApplication IDs to individual scores
 * @param  {Object} teamScores              The object mapping Team IDs to team average scores
 * @return {Number}                         The score for this hacker, null if not fully scored
 */
export function calculateScore(application, individualScores, teamScores) {
  const hacker = application.hacker;
  const teamId = hacker.Team ? hacker.Team.teamId : null;

  if (teamId == null) {
    // The hacker isn't in a team
    // return the individual average score if it exists, null otherwise
    const score = individualScores[application.id];
    return score ? score : null;
  } else {
    // The hacker is in a team
    const teamScore = teamScores[teamId];
    if (teamScore === undefined) {
      // Something went wrong, couldn't find the hackers team
      console.log(`Error: Could not find score for team ${teamId}`);
      return null;
    } else {
      return teamScore; // This may be null
    }
  }
}

/**
 * Takes a Team with associated HackerApplications and
 * the set of individual scores and calculates the teams
 * average score
 * @return {Number}  The average score for the team, null if team has not been fully scored
 */
export function calculateTeamAverage(team, individualScores) {
  const teamMembers = team.teamMembers;
  const teamMembersScores = teamMembers.map(member => {
    const memberApplicationId = member.hacker.hackerApplication.id;
    const score = individualScores[memberApplicationId];
    return score !== undefined ? score : null;
  });
  // Check that all the teamMembers have been scored
  // Return the average of those scores
  return averageOrNull(teamMembersScores);
}

/**
 * Takes an array of numbers and returns the average or null if any one of them is null
 */
function averageOrNull(values) {
  let sum = 0;
  const length = values.length;
  for (let i = 0; i < length; i++) {
    if (values[i] === null) { return null; }
    sum += values[i];
  }
  return sum / length;
}

/**
 * Gets all applications and includes the TeamMember relation
 * @return {Promise.<[HackerApplication]>} Promise that resolves to the resulting HackerApplications
 */
export function getApplicationsWithTeams() {
  return HackerApplication.findAll({
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
}

/**
 * Gets a score for applications that have more than 2 reviews
 * This DOES NOT take into account team averages, this is an individual score
 * @return {Promise} A Promise that resolves to an object. See below for format
 */
export function getIndividualScores() {
  // Get the individual scores (exist if reviews have been done)
  return db.query(individualScoreQuery, {
    type: Sequelize.QueryTypes.SELECT,
  }).then(individualScoresArr => {
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
    return individualScoresArr.reduce((scores, application) =>
      Object.assign(scores, {[application.application_id]: parseFloat(application.avg)}), {});
  });
}

/**
 * Gets a list of teams with the associated HackerApplications
 * @return {Promise.[Team]} A promise that resolves to the list of teams
 */
export function getTeamsWithMembers() {
  // Get the teams with members listed
  return Team.findAll({
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
}

/**
 * Takes the set of individual scores and the team listings and
 * produces a set of team average scores
 * @param  {Object} individualScores This is of the structure {'<application_id>': <score as float>, ... }
 * @param  {[Team]} teamsArr         Set of teams with the associated HackerApplication objects
 * @return {Object}                  This is of the structure {'<team_id>': <average score as float>, ...}
 */
export function calculateTeamsAverages(individualScores, teamsArr) {
  return teamsArr.reduce((teams, team) => Object.assign(teams, {[team.id]: calculateTeamAverage(team, individualScores)}), {});
}

/**
 * Takes a HackerApplication and returns whether or not that application
 * has been scored by the minimum number of reviewers
 * @param  {HackerApplication} application The application to check
 * @return {boolean}             Whether or not the application is fully scored
 */
export function applicationHasBeenIndividuallyScored(application) {
  return ApplicationReview.findAndCountAll({
    where: {
      hackerApplicationId: application.id,
    }
  }).then(result => result.count >= 2);
}

/**
 * Gets all applications with their true score and useful extra information.
 *
 * @param {Function} [weightingFunction] An optional function that takes in application
 *   object and returns a new score.
 */
export function getApplicationsWithScores(weightingFunction = (({ rating }) => rating)) {
  return Promise.all([
    getApplicationsWithTeams(),
    getIndividualScores(),
    getTeamsWithMembers(),
  ]).then(([applications, individualScores, teamsArr]) => {
    const teamScores = calculateTeamsAverages(individualScores, teamsArr);

    return applications.map(application => {
      const augmentedApplication = {
        id: application.id,
        name: `${application.hacker.firstName} ${application.hacker.lastName}`,
        gender: application.hacker.gender,
        country: application.countryTravellingFrom,
        institution: application.hacker.institution,
        inTeam: application.hacker.Team !== null,
        rating: calculateScore(application, individualScores, teamScores),
        status: application.applicationResponse !== null ?
          (application.applicationResponse.response === 'invited' ? 'Invited' : 'Not Invited') :
          'Pending',
      };

      augmentedApplication.rating = weightingFunction(augmentedApplication);

      return augmentedApplication;
    });
  });
}
