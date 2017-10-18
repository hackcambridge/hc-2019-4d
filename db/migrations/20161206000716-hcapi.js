'use strict';

let moment = require('moment');

function createAdminTable(queryInterface, Sequelize) {
  return queryInterface.createTable('admins', {
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
    name: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    email: {
      type: Sequelize.TEXT,
      allowNull: false,
      unique: true,
    }
  });
}

function createOauthAccessTokenTable(queryInterface, Sequelize) {
  return queryInterface.createTable('oauth-access-tokens', {
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
    token: {
      type: Sequelize.UUID,
      unique: true,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    expiresOn: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: () => moment().add(2, 'months').toDate(),
    },
    adminId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'admins',
        key: 'id',
        deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
  });
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    return createAdminTable(queryInterface, Sequelize)
      .then(() => createOauthAccessTokenTable(queryInterface, Sequelize));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('oauth-access-tokens')
      .then(() => queryInterface.dropTable('admins'));
  }
};
