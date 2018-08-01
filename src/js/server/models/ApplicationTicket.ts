import * as Sequelize from 'sequelize';

import db from './db';
import HackerApplication from './HackerApplication';

interface ApplicationTicketAttributes {
  id?: number;
  hackerApplicationId: number;
}

export type ApplicationTicketInstance = Sequelize.Instance<ApplicationTicketAttributes>
  & ApplicationTicketAttributes;

const attributes: SequelizeAttributes<ApplicationTicketAttributes> = {
  hackerApplicationId: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
  },
};

const ApplicationTicket =
  db.define<ApplicationTicketInstance, ApplicationTicketAttributes>('applicationTicket', attributes, {
    tableName: 'application-tickets',
  });

ApplicationTicket.belongsTo(HackerApplication);
HackerApplication.hasOne(ApplicationTicket);

export default ApplicationTicket;
