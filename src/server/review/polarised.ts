import { AugmentedApplication, getApplicationsWithScores } from './score-logic';

export async function getPolarisedApplications(aboveStdev: number): Promise<AugmentedApplication[]> {
  const augmentedApplications = await getApplicationsWithScores();
  const applicationsAboveThreshold = augmentedApplications.filter(app => app.ratingStdev > aboveStdev);
  return applicationsAboveThreshold.sort((a, b) => b.ratingStdev - a.ratingStdev);
}
