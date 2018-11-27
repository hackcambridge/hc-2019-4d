'use strict';

function generateTeamMember(id, teamId, hackerId) {
  let member = {
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    teamId,
    hackerId
  }

  return member;
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('teams-members', [
      generateTeamMember(1, 1, 1),
      generateTeamMember(2, 1, 2)
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('teams-members', null, {});
  }
};
