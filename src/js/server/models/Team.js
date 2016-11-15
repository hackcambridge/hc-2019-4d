const db = require('./db');

const Team = module.exports = db.define('team', { }, {
  tableName: 'teams'
});