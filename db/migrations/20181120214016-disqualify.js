'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn(
      'hackers-applications',
      'isDisqualified',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      }
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.removeColumn(
      'hackers-applications',
      'isDisqualified'
    )
};
