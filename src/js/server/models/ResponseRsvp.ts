import * as Sequelize from 'sequelize';

import ApplicationResponse from './ApplicationResponse';
import db from './db';

const RSVP_YES = 'RSVP_YES';
const RSVP_NO = 'RSVP_NO';
const RSVP_EXPIRED = 'RSVP_EXPIRED';

interface ResponseRsvpAttributes {
  id?: number;
  rsvp: string; // TODO: refine
  applicationResponseId: number;
}

export type ResponseRsvpInstance = Sequelize.Instance<ResponseRsvpAttributes>
  & ResponseRsvpAttributes;

const attributes: SequelizeAttributes<ResponseRsvpAttributes> = {
  rsvp: {
    type: Sequelize.ENUM(RSVP_YES, RSVP_NO, RSVP_EXPIRED),
    allowNull: false,
  },
  applicationResponseId: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
  },
};

const ResponseRsvp: any = db.define<ResponseRsvpInstance, ResponseRsvpAttributes>('responseRsvp', attributes, {
  tableName: 'response-rsvps',
});

ResponseRsvp.RSVP_YES = RSVP_YES;
ResponseRsvp.RSVP_NO = RSVP_NO;
ResponseRsvp.RSVP_EXPIRED = RSVP_EXPIRED;

ResponseRsvp.belongsTo(ApplicationResponse);
ApplicationResponse.hasOne(ResponseRsvp);

export default ResponseRsvp;
