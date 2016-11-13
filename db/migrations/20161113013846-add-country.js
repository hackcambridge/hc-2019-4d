'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'hackers-applications',
      'countryTravellingFrom',
      {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'GB',
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('hackers-applications', 'countryTravellingFrom');
  }
};
