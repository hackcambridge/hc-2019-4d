const { Hacker, HackerApplication, Team, TeamMember } = require('js/server/models');
const { getHackerFromEmailOrApplicationSlug } = require('./utils');
const { createHandler } = require('../utils');

module.exports = {
  command: 'get <email|applicationId>',
  desc: 'Get the team for a hacker',
  aliases: [],
  builder(yargs) {
    return yargs;
  },
  handler: createHandler(({ email, applicationId }) => {
    if (!email) {
      return Promise.reject('No email or application id entered.');
    }

    return getHackerFromEmailOrApplicationSlug(email).then(user => 
      user.getTeam().then(teamMember => {
        if (teamMember === null) {
          console.log('Hacker is not in a team.');
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
            console.log(`${email} is in team ${team.id}.  Members:`);
            team.teamMembers.map(member => console.log(`* (${member.hacker.id}) ${member.hacker.firstName} ${member.hacker.lastName} <${member.hacker.email}> ${member.hacker.hackerApplication.applicationSlug}`));
          });
        }
      })
    );
  })
};