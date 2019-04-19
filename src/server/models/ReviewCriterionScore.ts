import * as Sequelize from 'sequelize';
import { Model } from 'sequelize';

import { ApplicationReview } from './ApplicationReview';
import db from './db';
import { ReviewCriterion } from './ReviewCriterion';

export class ReviewCriterionScore extends Model {
  public id?: number;
  public applicationReviewId: number;
  public reviewCriterionId: number;
  public score: number;
}

ReviewCriterionScore.init({
  applicationReviewId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  reviewCriterionId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  score: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  sequelize: db,
  modelName: 'reviewCriterionScore',
  tableName: 'review-criteria-scores',
});

ReviewCriterionScore.belongsTo(ReviewCriterion);
ReviewCriterionScore.belongsTo(ApplicationReview);
ApplicationReview.hasMany(ReviewCriterionScore);
