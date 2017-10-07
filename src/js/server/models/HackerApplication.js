const Sequelize = require('sequelize');
const db = require('./db');
const Hacker = require('./Hacker');

const HackerApplication = module.exports = db.define('hackerApplication', {
  hackerId: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
    references: {
      model: Hacker,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  applicationSlug: {
    type: Sequelize.TEXT,
    allowNull: false,
    unique: true
  },
  cv: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  developmentRoles: {
    type: Sequelize.ARRAY(Sequelize.TEXT),
    allowNull: false,
  },
  learningGoal: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  interests: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  recentAccomplishment: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  countryTravellingFrom: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  links: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  inTeam: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  wantsTeam: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
}, {
  tableName: 'hackers-applications'
});

HackerApplication.belongsTo(Hacker);
Hacker.hasOne(HackerApplication);