const Sequelize = require('sequelize');
const db = require('./db');
const HackerApplication = require('./HackerApplication');

const ApplicationTicket = module.exports = db.define('applicationTicket', {
  hackerApplicationId: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
  },
}, {
  tableName: 'application-tickets',
});

ApplicationTicket.belongsTo(HackerApplication);
HackerApplication.hasOne(ApplicationTicket);
