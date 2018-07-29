import * as fs from 'fs';
import * as path from 'path';

import { getSerializedTeamAssignments } from 'js/server/attendance/team-logic';
import { createHandler } from '../utils';

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
        fs.writeFileSync(path.resolve(process.cwd(), outputfile), JSON.stringify(teams, null, 2));
        console.log(`Wrote ${teams.length} teams to ${outputfile}.`);
      })
  ),
};
