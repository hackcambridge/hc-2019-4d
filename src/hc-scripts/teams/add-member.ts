import { TeamMember } from 'server/models';
import { createHandler } from '../utils';
import { getHackerFromEmailOrApplicationSlug } from './utils';

export default {
  command: 'add-member teamId <email|applicationId>',
  desc: 'Add a hacker to a team',
  aliases: [],
  handler: createHandler(({ teamId, email }) =>
    getHackerFromEmailOrApplicationSlug(email).then(hacker =>
      TeamMember.findOne({
        where: { hackerId: hacker.id }
      }).then(teamMember => {
        if (teamMember !== null) {
          return Promise.reject(`Hacker already in team ${teamMember.teamId}`);
        } else {
          return TeamMember.create({
            teamId,
            hackerId: hacker.id
          }).then(_newTeamMember => {
            console.log(`Added hacker ${email} to team ${teamId}`);
          });
        }
      })
    )
  )
};
