const db = require('./db');

const Hacker = require('./Hacker');
const HackerApplication = require('./HackerApplication');
const ApplicationResponse = require('./ApplicationResponse');

const dbSynced = db.sync().then(() => { console.log('Database synced') });

module.exports = {
  db,
  Hacker,
  HackerApplication,
  ApplicationResponse,
  dbSynced,
};