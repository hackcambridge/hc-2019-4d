const { getSerializedTeamAssignments } = require('js/server/attendance/team-logic');
const yargs = require('yargs');
const { createHandler } = require('../utils');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'suggest <outputfile>',
  desc: 'Suggest allocations for teams',
  aliases: [],
  builder(yargs) {
    return yargs;
  },
  handler: createHandler(({ outputfile }) => 
    getSerializedTeamAssignments()
      .then((teams) => {
        fs.writeFileSync(path.resolve(process.cwd(), outputfile), JSON.stringify(teams));
        console.log(`Wrote ${teams.length} teams to ${outputfile}.`);
      })
  ),
};
