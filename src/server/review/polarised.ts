import { groupBy, mapValues, pickBy, sum } from 'lodash';
import { std as stdev } from 'mathjs';

import { ReviewCriterionScore } from 'server/models';
import ApplicationReview, { ApplicationReviewInstance } from 'server/models/ApplicationReview';

export function getCriterionScoreValues(review: ApplicationReviewInstance): ReadonlyArray<number> {
  return review.reviewCriterionScores.map(criterionScore => criterionScore.score);
}

export function getReviewSetStdev(reviewSet: ReadonlyArray<ApplicationReviewInstance>): number {
  const reviewCriterionScores = reviewSet.map(getCriterionScoreValues);
  const totalScores = reviewCriterionScores.map(sum);
  return stdev(totalScores);
}

export async function getPolarisedApplications(aboveStdev: number) {
  const applicationReviewSets = groupBy(await ApplicationReview.findAll({
    include: [ReviewCriterionScore]
  }), review => review.hackerApplicationId);
  const filteredReviewSets = pickBy(applicationReviewSets, (reviews, _applicationId) => reviews.length >= 2);
  const applicationStdevs = mapValues(filteredReviewSets, getReviewSetStdev);

  const filteredApplicationStdevs = pickBy(applicationStdevs, appStdev => appStdev > aboveStdev);

  const polarisedApplicationsDescending = Object.keys(filteredApplicationStdevs).sort(
    (idA, idB) => filteredApplicationStdevs[idB] - filteredApplicationStdevs[idA]);

  return polarisedApplicationsDescending.map(id => ({
    id: parseInt(id, 10),
    reviewSets: applicationReviewSets[id],
    stdev: polarisedApplicationsDescending[id]
  }));
}
