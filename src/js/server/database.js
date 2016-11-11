const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
  logging: false
});

const Hacker = sequelize.define('hacker', {
  // Personal
  firstName: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  dateOfBirth: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  email: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phoneNumber: {
    type: Sequelize.STRING,
  },
  // Education
  institution: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  studyLevel: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  course: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  // Logistics
  shirtSize: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  dietaryRestrictions: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  specialNeeds: {
    type: Sequelize.TEXT,
  },
}, {
  tableName: 'hackers'
});

HackerApplication = sequelize.define('hacker-application', {
  // Foreign key
  hackerID: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Hacker,
      key: 'id',
      deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
    },
  },
  // Application
  applicationID: {
    type: Sequelize.TEXT,
    allowNull: false,
    unique: true
  },
  accepted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  CV: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  developmentRoles: {
    type: Sequelize.JSON,
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

Hacker.sync();
HackerApplication.sync();

var exports = module.exports = {
  sequelize,
  Hacker,
  HackerApplication,
};