const Sequelize = require('sequelize');
const db = require('./db');
const HackerApplication = require('./HackerApplication');

const ApplicationResponse = module.exports = db.define('applicationResponse', {
  response: {
    type: Sequelize.ENUM('invited', 'rejected'),
    allowNull: false,
  },
}, {
  tableName: 'application-responses',
});

ApplicationResponse.belongsTo(HackerApplication);
HackerApplication.hasOne(ApplicationResponse);
