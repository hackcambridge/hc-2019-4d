const Sequelize = require('sequelize');
const db = require('./db');
const Hacker = require('./Hacker');
const Team = require('./Team');

const TeamMember = module.exports = db.define('team-member', {
  // Foreign keys
  teamId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Team,
      key: 'id',
      deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
    },
  },
  hackerId: {
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
Team.hasMany(TeamMember);
TeamMember.belongsTo(Hacker);
Hacker.hasOne(TeamMember, { as: 'Team' });