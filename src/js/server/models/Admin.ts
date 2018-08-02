import * as Sequelize from 'sequelize';

import db from './db';

interface AdminAttributes {
  id?: number;
  name: string;
  email: string;
  lowCommittal?: boolean; // false by default
}

export type AdminInstance = Sequelize.Instance<AdminAttributes> & AdminAttributes;

const attributes: SequelizeAttributes<AdminAttributes> = {
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
};

export default db.define<AdminInstance, AdminAttributes>('admin', attributes, {
  tableName: 'admins',
});
