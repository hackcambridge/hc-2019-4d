const Sequelize = require('sequelize');
const db = require('./db');
const HackerApplication = require('./HackerApplication');

const Admin = module.exports = db.define('admin', {
  name: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  email: {
    type: Sequelize.TEXT,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'admins',
});
