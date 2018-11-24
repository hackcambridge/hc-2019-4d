import * as Sequelize from 'sequelize';

import db from './db';

interface ReviewCriterionAttributes {
  id?: number;
  maxValue: number;
  label: string;
}

type ReviewCriterionInstance = Sequelize.Instance<ReviewCriterionAttributes>
  & ReviewCriterionAttributes;

const attributes: SequelizeAttributes<ReviewCriterionAttributes> = {
  maxValue: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  label: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
};

export default db.define<ReviewCriterionInstance, ReviewCriterionAttributes>('reviewCriterion', attributes, {
  tableName: 'review-criteria',
});
