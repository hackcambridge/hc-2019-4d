'use strict';

module.exports = {
  up: (queryInterface, _Sequelize) => {
    return queryInterface.renameColumn('hackers-applications', 'isDisqualified', 'isWithdrawn');
  },

  down: (queryInterface, _Sequelize) => {
    return queryInterface.renameColumn('hackers-applications', 'isWithdrawn', 'isDisqualified');
  }
};
