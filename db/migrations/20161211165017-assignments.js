'use strict';

/**
 * This table allows us to record who has been assigned which applications
 * so we can avoid often ending up with more than 2 reviews of a single application
 */

function createApplicationAssignmentsTable(queryInterface, Sequelize) {
  return queryInterface.createTable('application-assignments', {
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
    adminId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id',
        deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
    hackerApplicationId: {
      type: Sequelize.INTEGER,
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
    return createApplicationAssignmentsTable(queryInterface, Sequelize);
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('application-assignments');
  }
};
