import * as Sequelize from 'sequelize';
import { Model } from 'sequelize';

import { CompleteRsvpStatus } from 'shared/statuses';
import { ApplicationResponse } from './ApplicationResponse';
import db from './db';

export class ResponseRsvp extends Model {
  public id?: number;
  public rsvp: CompleteRsvpStatus;
  public applicationResponseId: number;
}

ResponseRsvp.init({
  rsvp: {
    type: Sequelize.ENUM(CompleteRsvpStatus.RSVP_YES, CompleteRsvpStatus.RSVP_NO, CompleteRsvpStatus.RSVP_EXPIRED),
    allowNull: false,
  },
  applicationResponseId: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
  },
}, {
  sequelize: db,
  modelName: 'responseRsvp',
  tableName: 'response-rsvps',
});

ResponseRsvp.belongsTo(ApplicationResponse);
ApplicationResponse.hasOne(ResponseRsvp);
