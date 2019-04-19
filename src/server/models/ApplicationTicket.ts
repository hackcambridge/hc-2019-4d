import * as Sequelize from 'sequelize';
import { Model } from 'sequelize';

import db from './db';
import { HackerApplication } from './HackerApplication';

export class ApplicationTicket extends Model {
  public id?: number;
  public hackerApplicationId: number;

  public hackerApplication?: HackerApplication;
}

ApplicationTicket.init({
  hackerApplicationId: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
  },
}, {
  sequelize: db,
  modelName: 'applicationTicket',
  tableName: 'application-tickets',
});

ApplicationTicket.belongsTo(HackerApplication);
HackerApplication.hasOne(ApplicationTicket);
