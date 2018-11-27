'use strict';

function generateTeam(id) {
  let team = {
    id,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return team;
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('teams', [
      generateTeam(1)
      ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('teams', null, {});
  }
};
