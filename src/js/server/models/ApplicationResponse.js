const Sequelize = require('sequelize');
const db = require('./db');
const HackerApplication = require('./HackerApplication');

const ApplicationResponse = module.exports = db.define('applicationResponse', {
  response: Sequelize.ENUM('invited', 'rejected'),
}, {
  tableName: 'application-responses',
});

ApplicationResponse.belongsTo(HackerApplication);
