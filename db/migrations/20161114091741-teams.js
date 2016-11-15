'use strict';

function createTeamTable(queryInterface, Sequelize) {
  return queryInterface.createTable('teams', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
}

function createTeamMemberTable(queryInterface, Sequelize) {
  return queryInterface.createTable('teams-members', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    // Foreign keys
    teamId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
        deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
    hackerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'hackers',
        key: 'id',
        deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
  });
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    return createTeamTable(queryInterface, Sequelize)
      .then(() => createTeamMemberTable(queryInterface, Sequelize));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('teams-members')
      .then(() => queryInterface.dropTable('teams'));
  }
};
