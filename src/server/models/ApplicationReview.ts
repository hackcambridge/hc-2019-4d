import * as Sequelize from 'sequelize';

import Admin from './Admin';
import db from './db';
import HackerApplication from './HackerApplication';
import { ReviewCriterionScoreInstance } from './ReviewCriterionScore';

interface ApplicationReviewAttributes {
  id?: number;
  adminId: number;
  hackerApplicationId: number;
}
export interface ApplicationReviewInstance extends Sequelize.Instance<ApplicationReviewAttributes>, ApplicationReviewAttributes {
  reviewCriterionScores?: ReviewCriterionScoreInstance[];
}

const attributes: SequelizeAttributes<ApplicationReviewAttributes> = {
  adminId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  hackerApplicationId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
};

const ApplicationReview =
  db.define<ApplicationReviewInstance, ApplicationReviewAttributes>('applicationReview', attributes, {
    tableName: 'application-reviews',
  });

ApplicationReview.belongsTo(Admin);

ApplicationReview.belongsTo(HackerApplication);
HackerApplication.hasMany(ApplicationReview);

export default ApplicationReview;
