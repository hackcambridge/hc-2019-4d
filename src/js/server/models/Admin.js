const Sequelize = require('sequelize');
const db = require('./db');

module.exports = db.define('admin', {
  name: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  email: {
    type: Sequelize.TEXT,
    allowNull: false,
    unique: true,
  },
  // If the admin is low committal, don't count them when calculating targets.
  lowCommittal: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'admins',
});
