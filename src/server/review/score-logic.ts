import * as fs from 'fs';
import * as math from 'mathjs';
import * as Sequelize from 'sequelize';

import { ApplicationResponse, ApplicationReview, db, Hacker, HackerApplication, HackerApplicationInstance, HackerInstance,
         ReviewCriterionScore, Team, TeamInstance, TeamMember } from 'server/models';

interface NumWithStdev {
  value: number;
  stdev: number;
}
interface ScoreMap { [key: number]: NumWithStdev; }

const individualScoreQuery = fs.readFileSync('src/server/review/individual_scores.sql', 'utf8');

/**
 * Takes a HackerApplication and the set of individual scores,
 * produces the validated, group averaged (if necessary) score
 * for that application.
 *
 * Returns null if they are not 'fully scored', i.e. they are yet to recieve at least two reviews.
 *
 * @param application      The HackerApplication of the person to score
 * @param individualScores The object mapping HackerApplication IDs to individual scores
 * @param teamScores       The object mapping Team IDs to team average scores
 * @return                 The score for this hacker, null if not fully scored
 */
export function calculateScore(
  application: HackerApplicationInstance,
  individualScores: ScoreMap,
  teamScores: ScoreMap): NumWithStdev | null {
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
 * the set of individual scores and calculates the team's
 * average score.
 * @return The average score for the team, null if team has not been fully scored.
 */
export function calculateTeamAverage(team: TeamInstance, individualScores: ScoreMap): NumWithStdev | null {
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
 * Takes an array of numbers and returns the average or null if any one of them is null.
 */
function averageOrNull(values: Array<NumWithStdev | null>): NumWithStdev | null {
  if (values.some(v => v === null)) {
    return null;
  }

  return {
    value: math.mean(values.map(v => v.value)),
    // Add errors in quadrature per https://en.wikipedia.org/wiki/Propagation_of_uncertainty
    stdev: math.sqrt(math.sum(values.map(v => Math.pow(v.stdev, 2)))) / values.length
  };
}

/**
 * Gets all applications and includes the TeamMember relation.
 */
export function getApplicationsWithTeams(): PromiseLike<HackerApplicationInstance[]> {
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
      {
        model: ApplicationReview,
        required: false,
        include: [
          {
            model: ReviewCriterionScore,
            required: false,
          },
        ],
      }
    ],
  });
}

/**
 * Gets a score for applications that have more than 2 reviews.
 * This DOES NOT take into account team averages, this is an individual score.
 */
export function getIndividualScores(): ScoreMap {
  // Get the individual scores (exist if reviews have been done)
  return db.query(individualScoreQuery, {
    type: Sequelize.QueryTypes.SELECT,
  }).then((individualScoresArr: ReadonlyArray<{ application_id: string, avg: string, stddev_samp: string }>) => {
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
    return individualScoresArr.reduce<ScoreMap>((scoresSoFar, application) => ({
        ...scoresSoFar,
        [application.application_id]: {
          value: parseFloat(application.avg),
          stdev: parseFloat(application.stddev_samp),
        }
      }), {});
  });
}

/**
 * Gets a list of teams with the associated HackerApplications.
 */
export function getTeamsWithMembers(): PromiseLike<TeamInstance[]> {
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
 * produces a set of team average scores.
 */
export function calculateTeamsAverages(individualScores: ScoreMap, teamsArr: ReadonlyArray<TeamInstance>): ScoreMap {
  return teamsArr.reduce<ScoreMap>((scoresSoFar, team) => ({
    ...scoresSoFar,
    [team.id]: calculateTeamAverage(team, individualScores)
  }), {});
}

/**
 * Takes a HackerApplication and returns whether or not that application
 * has been scored by the minimum number of reviewers.
 * @param application The application to check
 * @return Whether or not the application is fully scored
 */
export async function applicationHasBeenIndividuallyScored(application: HackerApplicationInstance): Promise<boolean> {
  const result = await ApplicationReview.findAndCountAll({
    where: {
      hackerApplicationId: application.id,
    }
  });
  return result.count >= 2;
}

export interface AugmentedApplication {
  id: number;
  hackerId: number;
  name: string;
  email: string;
  gender: string;
  country: string;
  institution: string;
  /**
   * All the hackers that must be invited if this application is invited.
   *
   * If the hacker has made an individual application, this will contain just the hacker.
   * If the hacker has made a team applications, this will contain the whole team.
   */
  associatedHackers: HackerInstance[];
  inTeam: boolean;
  isWithdrawn: boolean;
  rating: number;
  ratingStdev: number;
  status: string;
  visaNeededBy: Date;
}

function getAssociatedHackers(hacker: HackerInstance, teamsArr: ReadonlyArray<TeamInstance>): HackerInstance[] {
  return hacker.Team !== null ?
    teamsArr.find(team => team.id === hacker.Team.teamId).teamMembers.map(member => member.hacker) :
    [hacker];
}

function deriveScoringStatus(application: HackerApplicationInstance): string {
  if (application.isWithdrawn) {
    return 'Withdrawn';
  }
  if (application.applicationResponse === null) {
    return 'Pending';
  }
  return application.applicationResponse.response === 'invited' ? 'Invited' : 'Not Invited';
}

function augmentApplication(
  application: HackerApplicationInstance,
  rating: NumWithStdev,
  teamsArr: ReadonlyArray<TeamInstance>): AugmentedApplication {
  return {
    id: application.id,
    hackerId: application.hacker.id,
    name: `${application.hacker.firstName} ${application.hacker.lastName}`,
    email: application.hacker.email,
    gender: application.hacker.gender,
    country: application.countryTravellingFrom,
    institution: application.hacker.institution,
    associatedHackers: getAssociatedHackers(application.hacker, teamsArr),
    inTeam: application.hacker.Team !== null,
    isWithdrawn: application.isWithdrawn,
    rating: rating !== null ? rating.value : null,
    ratingStdev: rating !== null ? rating.stdev : null,
    status: deriveScoringStatus(application),
    visaNeededBy: application.visaNeededBy,
  };
}

async function getAugmentedApplications(): Promise<ReadonlyArray<AugmentedApplication>> {
  const [applications, individualScores, teamsArr] = await Promise.all([
    getApplicationsWithTeams(),
    getIndividualScores(),
    getTeamsWithMembers(),
  ]);
  const teamScores = calculateTeamsAverages(individualScores, teamsArr);

  return applications.map(application => {
    const rating = calculateScore(application, individualScores, teamScores);
    return augmentApplication(application, rating, teamsArr);
  });
}

/**
 * Gets all applications with their true score and useful extra information.
 *
 * @param weightingFunction An optional function that takes in application
 *   object and returns a new score.
 */
export async function getApplicationsWithScores(
  weightingFunction: (app: AugmentedApplication) => number = ({ rating }) => rating
): Promise<ReadonlyArray<AugmentedApplication>> {
  const augmentedApplications = await getAugmentedApplications();

  return augmentedApplications.map(application => ({
    ...application,
    rating: weightingFunction(application)
  }));
}
