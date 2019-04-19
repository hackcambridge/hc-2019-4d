import * as Sequelize from 'sequelize';
import { Model } from 'sequelize';

import { Admin } from './Admin';
import db from './db';
import { HackerApplication } from './HackerApplication';
import { ReviewCriterionScore } from './ReviewCriterionScore';

export class ApplicationReview extends Model {
  public id?: number;
  public adminId: number;
  public hackerApplicationId: number;

  public reviewCriterionScores?: ReviewCriterionScore[];
}

ApplicationReview.init({
  adminId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  hackerApplicationId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  sequelize: db,
  modelName: 'applicationReview',
  tableName: 'application-reviews',
});

ApplicationReview.belongsTo(Admin);

ApplicationReview.belongsTo(HackerApplication);
HackerApplication.hasMany(ApplicationReview);
