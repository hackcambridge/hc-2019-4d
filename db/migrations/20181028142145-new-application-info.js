'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'hackers-applications',
      'graduationYear', {
        type: Sequelize.TEXT,
        allowNull: false,
      }
    );
    await queryInterface.addColumn(
      'hackers-applications',
      'wantsMailingList', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    );
    await queryInterface.addColumn(
      'hackers-applications',
      'visaNeededBy', {
        type: Sequelize.DATE,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'hackers-applications',
      'needsVisa', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    );
    await queryInterface.addColumn(
      'hackers-applications',
      'otherInfo', {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'hackers-applications',
      'graduationYear'
    );
    await queryInterface.removeColumn(
      'hackers-applications',
      'needsVisa'
    );
    await queryInterface.removeColumn(
      'hackers-applications',
      'visaNeededBy'
    );
    await queryInterface.removeColumn(
      'hackers-applications',
      'wantsMailingList'
    );
    await queryInterface.removeColumn(
      'hackers-applications',
      'otherInfo'
    );
  }
};