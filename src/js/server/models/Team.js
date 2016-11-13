const Sequelize = require('sequelize');
const db = require('./db');

const Team = module.exports = sequelize.define('team', { }, {
  tableName: 'teams'
});