'use strict';

/**
 * RSVPs and tickets are used to track whether invited applicants are coming to the hackathon
 * or not.
 */

function createRsvpsTable(queryInterface, Sequelize) {
  return queryInterface.createTable('response-rsvps', {
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
    applicationResponseId: {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: false,
      references: {
        model: 'application-responses',
        key: 'id',
        deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
    rsvp: {
      type: Sequelize.ENUM('RSVP_YES', 'RSVP_NO'),
      allowNull: false,
    },
  });
}

function createTicketsTable(queryInterface, Sequelize) {
  return queryInterface.createTable('application-tickets', {
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
    hackerApplicationId: {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: false,
      references: {
        model: 'hackers-applications',
        key: 'id',
        deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
  });
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      createRsvpsTable(queryInterface, Sequelize),
      createTicketsTable(queryInterface, Sequelize)
    ]);
  },

  down: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.dropTable('response-rsvps'),
      queryInterface.dropTable('application-tickets')
    ]);
  }
};
