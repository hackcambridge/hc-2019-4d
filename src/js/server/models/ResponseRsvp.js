const Sequelize = require('sequelize');
const db = require('./db');
const ApplicationResponse = require('./ApplicationResponse');

const RSVP_YES = 'RSVP_YES';
const RSVP_NO = 'RSVP_NO';
const RSVP_EXPIRED = 'RSVP_EXPIRED';

const ResponseRsvp = module.exports = db.define('responseRsvp', {
  rsvp: {
    type: Sequelize.ENUM(RSVP_YES, RSVP_NO, RSVP_EXPIRED),
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
ResponseRsvp.RSVP_EXPIRED = RSVP_EXPIRED;

ResponseRsvp.belongsTo(ApplicationResponse);
ApplicationResponse.hasOne(ResponseRsvp);
