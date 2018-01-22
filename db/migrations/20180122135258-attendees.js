'use strict';

function createAttendeesTable(queryInterface, Sequelize) {
  return queryInterface.createTable('attendees', {
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
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
  });
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return createAttendeesTable(queryInterface, Sequelize);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('attendees');
  }
};
