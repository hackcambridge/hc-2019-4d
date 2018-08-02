import * as fs from 'fs';
import * as path from 'path';

import { sendTeamEmail } from 'js/server/attendance/team-logic';
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
  desc: 'Take any pending invitations that are too old and expire them',
  aliases: [],
  handler: createHandler(({ inputfile }) => {
    const teams = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), inputfile)).toString());

    console.log(`Sending emails to ${teams.length} team${teams.length != 1 ? 's' : ''}`);

    return createTeamQueue(teams).process();
  }),
};
