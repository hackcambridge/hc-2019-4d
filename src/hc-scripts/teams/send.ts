import * as fs from 'fs';
import * as path from 'path';

import { sendTeamEmail } from 'server/attendance/team-logic';
import { createHandler } from '../utils';

function createTeamQueue(teamsToProcess) {
  // Defensive clone for mutating array
  const teams = teamsToProcess.slice(0);

  const processTeamQueue = () => {
    if (teams.length === 0) {
      return Promise.resolve();
    }

    const team = teams.pop();

    return sendTeamEmail(team).then(() => processTeamQueue());
  };

  return {
    process: processTeamQueue,
  };
}

export default {
  command: 'send <inputfile>',
  desc: 'Send team allocations emails to hackers',
  aliases: [],
  handler: createHandler(({ inputfile }) => {
    const teams = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), inputfile)).toString());

    console.log(`Sending emails to ${teams.length} team${teams.length !== 1 ? 's' : ''}`);

    return createTeamQueue(teams).process();
  }),
};
