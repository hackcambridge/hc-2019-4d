const Sequelize = require('sequelize');
const db = require('./db');
const ApplicationReview = require('./ApplicationReview');
const ReviewCriterion = require('./ReviewCriterion');

const ReviewCriterionScore = module.exports = db.define('reviewCriterionScore', {
  applicationReviewId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  reviewCriterionId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  score: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'review-criteria-scores',
});

ReviewCriterionScore.belongsTo(ReviewCriterion);
ReviewCriterionScore.belongsTo(ApplicationReview);
ApplicationReview.hasMany(ReviewCriterionScore);
