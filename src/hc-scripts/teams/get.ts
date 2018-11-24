import { Hacker, HackerApplication, Team, TeamMember } from 'server/models';
import { createHandler } from '../utils';
import { getHackerFromEmailOrApplicationSlug } from './utils';

export default {
  command: 'get <email|applicationId>',
  desc: 'Get the team for a hacker',
  aliases: [],
  builder(yargs) {
    return yargs;
  },
  // `email` represents an email or an application ID.  We need to call this variable
  // either "email" or "applicationId" to get the correct argument defined in the command.
  handler: createHandler(async ({ email }) => {
    const emailOrApplicationId = email;
    const user = await getHackerFromEmailOrApplicationSlug(emailOrApplicationId);
    const teamMember = await user.getTeam();
    if (teamMember === null) {
      throw new Error('Hacker is not in a team.');
    }
    const team = await Team.findOne({
      where: {
        id: teamMember.teamId
      },
      include: [
        {
          model: TeamMember,
          required: true,
          include: [
            {
              model: Hacker,
              include: [{ model: HackerApplication }],
            },
          ],
        }
      ]
    });

    console.log(`${emailOrApplicationId} is in team ${team.id}.  Members:`);
    team.teamMembers.map(member =>
      console.log(`* Hacker: ${member.hacker.id} ${member.hacker.firstName} ${member.hacker.lastName} <${member.hacker.email}>.  ` +
        `Application: ${member.hacker.hackerApplication.id} ${member.hacker.hackerApplication.applicationSlug}`));
  })
};
