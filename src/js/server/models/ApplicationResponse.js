const Sequelize = require('sequelize');
const db = require('./db');
const HackerApplication = require('./HackerApplication');
const { response } = require('js/shared/status-constants');

const ApplicationResponse = module.exports = db.define('applicationResponse', {
  response: {
    type: Sequelize.ENUM(response.INVITED, response.REJECTED),
    allowNull: false,
  },
}, {
  tableName: 'application-responses',
});

ApplicationResponse.belongsTo(HackerApplication);
HackerApplication.hasOne(ApplicationResponse);
