import * as Sequelize from 'sequelize';
import { Model } from 'sequelize';

import db from './db';

export class ReviewCriterion extends Model {
  public id?: number;
  public maxValue: number;
  public label: string;
}

ReviewCriterion.init({
  maxValue: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  label: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
}, {
  sequelize: db,
  modelName: 'reviewCriterion',
  tableName: 'review-criteria',
});
