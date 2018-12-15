import * as Sequelize from 'sequelize';

import { CompleteRsvpStatus } from 'shared/statuses';
import ApplicationResponse from './ApplicationResponse';
import db from './db';

interface ResponseRsvpAttributes {
  id?: number;
  rsvp: CompleteRsvpStatus;
  applicationResponseId: number;
}

export type ResponseRsvpInstance = Sequelize.Instance<ResponseRsvpAttributes>
  & ResponseRsvpAttributes;

const attributes: SequelizeAttributes<ResponseRsvpAttributes> = {
  rsvp: {
    type: Sequelize.ENUM(CompleteRsvpStatus.RSVP_YES, CompleteRsvpStatus.RSVP_NO, CompleteRsvpStatus.RSVP_EXPIRED),
    allowNull: false,
  },
  applicationResponseId: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
  },
};

const ResponseRsvp = db.define<ResponseRsvpInstance, ResponseRsvpAttributes>('responseRsvp', attributes, {
  tableName: 'response-rsvps',
});

ResponseRsvp.belongsTo(ApplicationResponse);
ApplicationResponse.hasOne(ResponseRsvp);

export default ResponseRsvp;
