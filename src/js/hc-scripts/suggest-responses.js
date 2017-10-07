const { createHandler } = require('./utils');
const { getApplicationsWithScores } = require('js/server/review/score-logic');
const fs = require('fs');
const path = require('path');

function getAugmentScore() {
  try {
    return require('./augment-score');
  } catch (error) {
    console.error('Could not find function to augment score');
    throw error;
  }
}

function getChooseApplicants() {
  try {
    return require('./choose-applicants');
  } catch (error) {
    console.error('Could not find function to choose applicants');
    throw error;
  }
}


function createComparisonFunction(inviteType) {
  if (inviteType === 'invite') {
    // Descending order
    return ({ rating: ratingA }, { rating: ratingB }) => ratingB - ratingA;
  }

  if (inviteType === 'reject') {
    // Ascending order
    return ({ rating: ratingA }, { rating: ratingB }) => ratingA - ratingB;
  }

  throw new Error(`Could not find comparison function for invite type ${invite}`);
}

module.exports = {
  command: 'suggest-responses <type> <limit> <outputfile>',
  desc: 'Suggest a set of people to respond to and saves them to a file',
  aliases: [],
  builder(yargs) {
    return yargs;
  },
  handler: createHandler(({ type, limit, outputfile }) =>
    getApplicationsWithScores(getAugmentScore())
      .then(applications => {
        // Consider only applicants whose application is pending (awaiting invitation)
        // Sort appropriately
        const sortedApplications = applications
          .filter(({ status, rating }) => status === 'Pending' && rating != null)
          .sort(createComparisonFunction(type));

        return getChooseApplicants()(sortedApplications, limit, type);
      })
      .then(applications => {
        fs.writeFileSync(path.resolve(process.cwd(), outputfile), JSON.stringify(applications));
        console.log(`Wrote ${applications.length} applications to ${outputfile}.`);
      })
  ),
};