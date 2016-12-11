'use strict';

function createApplicationReviewTable(queryInterface, Sequelize) {
  return queryInterface.createTable('application-reviews', {
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
  }).then(() => queryInterface.addIndex(
    'application-reviews',
    ['adminId', 'hackerApplicationId'],
    {
      indicesType: 'UNIQUE'
    }
  ));
}

function createReviewCriterionTable(queryInterface, Sequelize) {
  return queryInterface.createTable('review-criteria', {
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
    maxValue: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    label: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  });
}

function createReviewCriterionScoreTable(queryInterface, Sequelize) {
  return queryInterface.createTable('review-criteria-scores', {
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
    applicationReviewId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'application-reviews',
        key: 'id',
        deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
    reviewCriterionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'review-criteria',
        key: 'id',
        deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  }).then(() => queryInterface.addIndex(
    'review-criteria-scores',
    ['applicationReviewId', 'reviewCriterionId'],
    {
      indicesType: 'UNIQUE'
    }
  ));
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    return createApplicationReviewTable(queryInterface, Sequelize)
      .then(() => createReviewCriterionTable(queryInterface, Sequelize))
      .then(() => createReviewCriterionScoreTable(queryInterface, Sequelize));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('review-criteria-scores')
      .then(() => queryInterface.dropTable('review-criteria'))
      .then(() => queryInterface.dropTable('application-reviews'));
  }
};
