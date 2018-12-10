'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn(
      'application-responses',
      'expiryDate',
      {
        type: Sequelize.DATE,
        allowNull: false
      }
    ),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn(
      'application-responses',
      'expiryDate'
    )
};
