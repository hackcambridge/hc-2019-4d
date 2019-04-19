import * as Sequelize from 'sequelize';
import { Model } from 'sequelize';

import db from './db';

export class Admin extends Model {
  public id?: number;
  public name: string;
  public email: string;
  public lowCommittal?: boolean; // false by default
}

Admin.init({
  name: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  email: {
    type: Sequelize.TEXT,
    allowNull: false,
    unique: true,
  },
  // If the admin is low committal, don't count them when calculating targets.
  lowCommittal: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  sequelize: db,
  modelName: 'admin',
  tableName: 'admins',
});
