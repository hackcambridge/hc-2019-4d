import { Hacker, HackerApplication, Team, TeamMember } from 'js/server/models';
import { createHandler } from '../utils';
import { getHackerFromEmailOrApplicationSlug } from './utils';

export default {
  command: 'get <email|applicationId>',
  desc: 'Get the team for a hacker',
  aliases: [],
  builder(yargs) {
    return yargs;
  },
  handler: createHandler(({ emailOrApplicationId }) =>
    getHackerFromEmailOrApplicationSlug(emailOrApplicationId).then(user =>
      user.getTeam().then(teamMember => {
        if (teamMember === null) {
          return Promise.reject('Hacker is not in a team.');
        } else {
          const teamWithMembersPromise = Team.findOne({
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

          return teamWithMembersPromise.then(team => {
            console.log(`${emailOrApplicationId} is in team ${team.id}.  Members:`);
            team.teamMembers.map(member =>
              console.log(`* (${member.hacker.id}) ${member.hacker.firstName} ${member.hacker.lastName} ` +
                `<${member.hacker.email}> ${member.hacker.hackerApplication.applicationSlug}`));
          });
        }
      })
    )
  )
};
