const Sequelize = require('sequelize');
const db = require('./db');
const Team = require('./Team');

const TeamMember = module.exports = sequelize.define('team-member', {
  // Foreign keys
  teamID: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Team,
      key: 'id',
      deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
    },
  },
  hackerID: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Hacker,
      key: 'id',
      deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
    },
  },
}, {
  tableName: 'teams-members'
});

TeamMember.belongsTo(Team);
Team.hasMany(TeamMember, { as: 'Members' });