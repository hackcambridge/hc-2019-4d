const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
  logging: false
});

const Hacker = sequelize.define('hacker', {
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  applicationID: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    }
  },
  phoneNumber: {
    type: Sequelize.STRING,
  },
  accepted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
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
  tableName: 'hackers'
});

Hacker.sync();

var exports = module.exports = {
  sequelize,
  Hacker
};