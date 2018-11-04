'use strict';

function createRegisteredInvitees(queryInterface, Sequelize) {
  return queryInterface.createTable('registered-invitees', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    teamId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
    hackerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'hackers',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
  })
}

function createUnregisteredInvitees(queryInterface, Sequelize) {
  return queryInterface.createTable('unregistered-invitees', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    teamId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
      }
    }
  })
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return createRegisteredInvitees(queryInterface, Sequelize)
    .then(()=> createUnregisteredInvitees(queryInterface, Sequelize));
  },

  down: (queryInterface, Sequelize) => {
     return queryInterface.dropTable('registered-invitees')
     .then(() => queryInterface.dropTable('unregistered-invitees'));
  }
};