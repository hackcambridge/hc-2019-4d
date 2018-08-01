import * as Sequelize from 'sequelize';

import db from './db';
import HackerApplication from './HackerApplication';
import { response } from 'js/shared/status-constants';

interface ApplicationResponseAttributes {
  id?: number;
  response: string; // TODO: Update
  hackerApplicationId?: number;
}

type ApplicationResponseInstance = Sequelize.Instance<ApplicationResponseAttributes> &
  ApplicationResponseAttributes;

const attributes: SequelizeAttributes<ApplicationResponseAttributes> = {
  response: {
    type: Sequelize.ENUM(response.INVITED, response.REJECTED),
    allowNull: false,
  },
};

const ApplicationResponse = db.define<ApplicationResponseInstance, ApplicationResponseAttributes>('applicationResponse', attributes, {
  tableName: 'application-responses',
});

ApplicationResponse.belongsTo(HackerApplication);
HackerApplication.hasOne(ApplicationResponse);

export default ApplicationResponse;
