import * as Sequelize from 'sequelize';
import { Model } from 'sequelize';

import { Admin } from './Admin';
import db from './db';
import { HackerApplication } from './HackerApplication';

class ApplicationAssignment extends Model {
  public id?: number;
  public adminId: number;
  public hackerApplicationId: number;
}

ApplicationAssignment.init({
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
  modelName: 'applicationAssignment',
  tableName: 'application-assignments',
});

ApplicationAssignment.belongsTo(Admin);
ApplicationAssignment.belongsTo(HackerApplication);

export default ApplicationAssignment;
