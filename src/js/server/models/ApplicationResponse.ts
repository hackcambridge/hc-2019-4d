import * as Sequelize from 'sequelize';

import db from './db';
import HackerApplication from './HackerApplication';
import { response } from 'js/shared/status-constants';
import { ResponseRsvpInstance } from './ResponseRsvp';

interface ApplicationResponseAttributes {
  id?: number;
  response: string; // TODO: Update
  hackerApplicationId?: number;
}

export interface ApplicationResponseInstance extends Sequelize.Instance<ApplicationResponseAttributes>, ApplicationResponseAttributes {
  getResponseRsvp: () => Promise<ResponseRsvpInstance>;
}

const attributes: SequelizeAttributes<ApplicationResponseAttributes> = {
  response: {
    type: Sequelize.ENUM(response.INVITED, response.REJECTED),
    allowNull: false,
  },
};

const ApplicationResponse = db.define<ApplicationResponseInstance, ApplicationResponseAttributes>('applicationResponse', attributes, {
  tableName: 'application-responses',
});

ApplicationResponse.belongsTo(HackerApplication);
HackerApplication.hasOne(ApplicationResponse);

export default ApplicationResponse;
