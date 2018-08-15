import * as Sequelize from 'sequelize';

import db from './db';
import HackerApplication from './HackerApplication';
import Admin from './Admin';

interface ApplicationResponseAttributes {
  id?: number;
  adminId: number;
  hackerApplicationId: number;
}

type ApplicationResponseInstance = Sequelize.Instance<ApplicationResponseAttributes>
  & ApplicationResponseAttributes;

const attributes: SequelizeAttributes<ApplicationResponseAttributes> = {
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
  db.define<ApplicationResponseInstance, ApplicationResponseAttributes>('applicationReview', attributes, {
    tableName: 'application-reviews',
  });

ApplicationReview.belongsTo(Admin);
ApplicationReview.belongsTo(HackerApplication);

export default ApplicationReview;
