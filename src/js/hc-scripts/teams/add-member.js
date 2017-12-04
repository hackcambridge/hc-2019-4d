const { TeamMember } = require('js/server/models');
const { getHackerFromEmailOrApplicationSlug } = require('./utils');
const { createHandler } = require('../utils');

module.exports = {
  command: 'add-member teamId <email|applicationId>',
  desc: 'Add a hacker to a team',
  aliases: [],
  handler: createHandler(({ teamId, email, applicationId }) =>
    getHackerFromEmailOrApplicationSlug(email).then(hacker =>
      TeamMember.findOne({
        where: { hackerId: hacker.id }
      }).then(teamMember => {
        if (teamMember !== null) {
          console.log(`Hacker already in team ${teamMember.teamId}`);
        } else {
          return TeamMember.create({
            teamId: teamId,
            hackerId: hacker.id
          }).then(newTeamMember => {
            console.log(`Added hacker ${email} to team ${teamId}`);
          });
        }
      })
    )
  )
};