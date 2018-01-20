'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn(
      'admins',
      'lowCommittal',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.removeColumn(
      'admins',
      'lowCommittal'
    )
};
