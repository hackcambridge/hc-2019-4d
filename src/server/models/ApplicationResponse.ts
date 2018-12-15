import * as Sequelize from 'sequelize';

import { CompleteResponseStatus, ResponseStatus } from 'shared/status-constants';
import db from './db';
import HackerApplication, { HackerApplicationInstance } from './HackerApplication';
import { ResponseRsvpInstance } from './ResponseRsvp';

export interface ApplicationResponseAttributes {
  id?: number;
  createdAt?: Date;
  response: CompleteResponseStatus;
  hackerApplicationId?: number;
  expiryDate: Date;
}

export interface ApplicationResponseInstance extends Sequelize.Instance<ApplicationResponseAttributes>, ApplicationResponseAttributes {
  getHackerApplication: (data?: { transaction: Sequelize.Transaction }) => Promise<HackerApplicationInstance>;
  getResponseRsvp: () => Promise<ResponseRsvpInstance>;
}

const attributes: SequelizeAttributes<ApplicationResponseAttributes> = {
  response: {
    type: Sequelize.ENUM(ResponseStatus.INVITED, ResponseStatus.REJECTED),
    allowNull: false,
  },
  expiryDate: {
    type: Sequelize.DATE,
    allowNull: false
  }
};

const ApplicationResponse = db.define<ApplicationResponseInstance, ApplicationResponseAttributes>('applicationResponse', attributes, {
  tableName: 'application-responses',
});

ApplicationResponse.belongsTo(HackerApplication);
HackerApplication.hasOne(ApplicationResponse);

export default ApplicationResponse;
