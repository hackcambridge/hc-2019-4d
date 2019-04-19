import * as Sequelize from 'sequelize';
import { Model } from 'sequelize';

import db from './db';

export class ReviewSkips extends Model {
  public id?: number;
  public adminId: number;
  public hackerApplicationId: number;
}

ReviewSkips.init({
  adminId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: 'adminIdHackerApplicationIdCompositeUnique'
  },
  hackerApplicationId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: 'adminIdHackerApplicationIdCompositeUnique'
  },
}, {
  sequelize: db,
  modelName: 'reviewSkips',
  tableName: 'review-skips',
});
