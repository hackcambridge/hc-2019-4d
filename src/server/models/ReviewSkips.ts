import * as Sequelize from 'sequelize';

import db from './db';

interface ReviewSkipsAttributes {
  id?: number;
  adminId: number;
  hackerApplicationId: number;
}

type ReviewSkipsInstance = Sequelize.Instance<ReviewSkipsAttributes>
  & ReviewSkipsAttributes;

const attributes: SequelizeAttributes<ReviewSkipsAttributes> = {
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
};

const ReviewSkips =
  db.define<ReviewSkipsInstance, ReviewSkipsAttributes>('ReviewSkips', attributes, {
    tableName: 'review-skips',
  });

export default ReviewSkips;
