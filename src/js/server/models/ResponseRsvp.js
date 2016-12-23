const Sequelize = require('sequelize');
const db = require('./db');
const ApplicationResponse = require('./ApplicationResponse');

const RSVP_YES = 'RSVP_YES';
const RSVP_NO = 'RSVP_NO';

const ResponseRsvp = module.exports = db.define('responseRsvp', {
  rsvp: {
    type: Sequelize.ENUM(RSVP_YES, RSVP_NO),
    allowNull: false,
  },
  applicationResponseId: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
  },
}, {
  tableName: 'response-rsvps',
});

ResponseRsvp.RSVP_YES = RSVP_YES;
ResponseRsvp.RSVP_NO = RSVP_NO;

ResponseRsvp.belongsTo(ApplicationResponse);
ApplicationResponse.hasOne(ResponseRsvp);
