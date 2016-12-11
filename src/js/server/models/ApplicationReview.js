const Sequelize = require('sequelize');
const db = require('./db');
const HackerApplication = require('./HackerApplication');
const Admin = require('./Admin');

const ApplicationReview = module.exports = db.define('applicationReview', {
  adminId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  hackerApplicationId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'application-reviews',
});

ApplicationReview.belongsTo(Admin);
ApplicationReview.belongsTo(HackerApplication);
