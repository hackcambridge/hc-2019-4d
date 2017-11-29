const { createHandler } = require('./utils');
const { getHackersWithUnfinishedApplications } = require('js/server/apply/applicant-info');

function getEmailsOfHackersWithUnfinishedApplications(kind) {
  return getHackersWithUnfinishedApplications(kind).then(hackers => {
    const emails = hackers.map(hacker => hacker.email);

    console.log(`Emails of applicants with unfinished applications of kind ${kind}:`);
    if (emails.length > 0) {
      emails.map(email => console.log(email));
    } else {
      console.log('<none>');
    }
  });
}

module.exports = {
  command: 'unfinished-applications <kind>',
  desc: 'Get emails of all hackers who started an application but didn\'t finish it',
  aliases: [],
  builder(yargs) {
    return yargs
      .example('unfinished-applications individual', 'Get emails of hackers who didn\'t finish their individual application')
      .example('unfinished-applications team-only', 'Get emails of hackers who finished their individual application but not their team application');
  },
  handler: createHandler(({ kind }) =>
    getEmailsOfHackersWithUnfinishedApplications(kind)
  ),
};
