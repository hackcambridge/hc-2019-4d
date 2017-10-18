const { createHandler } = require('./utils');
const { getInvitationExpiryCandidates, expireInvitation } = require('js/server/attendance/logic');

function createExpiryQueue(responsesToProcess, dryRun) {
  // Defensive clone for mutating array
  const responses = responsesToProcess.slice(0);

  const processExpiryQueue = () => {
    if (responses.length === 0) {
      return Promise.resolve();
    }

    const response = responses.pop();

    console.log(`Expiring response ${response.id}. Date invited: ${response.createdAt}`);
    return (dryRun ? Promise.resolve() : expireInvitation(response)).then(() => {
      console.log(`Expired ${response.id}`);
    }, (error) => {
      console.error(`Failed to expire ${response.id}`);
      console.error(error);
    }).then(() => processExpiryQueue());
  };

  return {
    process: processExpiryQueue,
  };
}

module.exports = {
  command: 'expire-invitations [--dryRun]',
  desc: 'Take any pending invitations that are too old and expire them',
  aliases: [],
  builder(yargs) {
    return yargs.boolean('dryRun')
      .describe('dryRun', 'Display the candidates for expiry but do not expire them');
  },
  handler: createHandler(({ dryRun }) =>
    getInvitationExpiryCandidates().then((responses) => {
      console.log(`${dryRun ? 'Dry run expiring' : 'Expiring'} ${responses.length} invitation${responses.length != 1 ? 's' : ''}`);
      return createExpiryQueue(responses, dryRun).process();
    })
  ),
};
