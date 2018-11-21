import * as Sequelize from 'sequelize';

import ApplicationReview from './ApplicationReview';
import db from './db';
import ReviewCriterion from './ReviewCriterion';

interface ReviewCriterionScoreAttributes {
  id?: number;
  applicationReviewId: number;
  reviewCriterionId: number;
  score: number;
}

type ReviewCriterionScoreInstance = Sequelize.Instance<ReviewCriterionScoreAttributes>
  & ReviewCriterionScoreAttributes;

const attributes: SequelizeAttributes<ReviewCriterionScoreAttributes> = {
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
};

const ReviewCriterionScore =
  db.define<ReviewCriterionScoreInstance, ReviewCriterionScoreAttributes>('reviewCriterionScore', attributes, {
    tableName: 'review-criteria-scores',
  });

ReviewCriterionScore.belongsTo(ReviewCriterion);
ReviewCriterionScore.belongsTo(ApplicationReview);
ApplicationReview.hasMany(ReviewCriterionScore);

export default ReviewCriterionScore;
