import * as Sequelize from 'sequelize';
import { Model } from 'sequelize';

import { CompleteResponseStatus, ResponseStatus } from 'shared/statuses';
import db from './db';
import { HackerApplication } from './HackerApplication';
import { ResponseRsvp } from './ResponseRsvp';

export class ApplicationResponse extends Model {
  public id?: number;
  public createdAt?: Date;
  public response: CompleteResponseStatus;
  public hackerApplicationId?: number;
  public expiryDate: Date;

  public getHackerApplication: (data?: { transaction: Sequelize.Transaction }) => Promise<HackerApplication>;
  public hackerApplication?: HackerApplication;

  public getResponseRsvp: () => Promise<ResponseRsvp>;
}

ApplicationResponse.init({
  response: {
    type: Sequelize.ENUM(ResponseStatus.INVITED, ResponseStatus.REJECTED),
    allowNull: false,
  },
  expiryDate: {
    type: Sequelize.DATE,
    allowNull: false
  }
}, {
  sequelize: db,
  modelName: 'applicationResponse',
  tableName: 'application-responses',
});

ApplicationResponse.belongsTo(HackerApplication);
HackerApplication.hasOne(ApplicationResponse);
