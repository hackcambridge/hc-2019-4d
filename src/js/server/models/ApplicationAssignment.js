const Sequelize = require('sequelize');
const db = require('./db');
const HackerApplication = require('./HackerApplication');
const Admin = require('./Admin');

const ApplicationAssignment = module.exports = db.define('applicationAssignment', {
  adminId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  hackerApplicationId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'application-assignments',
});

ApplicationAssignment.belongsTo(Admin);
ApplicationAssignment.belongsTo(HackerApplication);
