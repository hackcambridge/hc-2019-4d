const Sequelize = require('sequelize');
const db = require('./db');

const ReviewCriterion = module.exports = db.define('reviewCriterion', {
  maxValue: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  label: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'review-criteria',
});
