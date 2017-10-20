const db = require('./db');

module.exports = db.define('team', { }, {
  tableName: 'teams'
});