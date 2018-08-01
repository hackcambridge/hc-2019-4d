import * as Sequelize from 'sequelize';

import db from './db';
import Hacker from './Hacker';
import { HackerInstance } from './Hacker'
import { ApplicationTicketInstance } from './ApplicationTicket';
import { ApplicationResponseInstance } from './ApplicationResponse';

interface HackerApplicationAttributes {
  id?: number;
  hackerId: number;
  applicationSlug: string;
  cv: string;
  developmentRoles: string[];
  learningGoal: string;
  interests: string;
  recentAccomplishment: string;
  countryTravellingFrom: string;
  links: string;
  inTeam: boolean;
  wantsTeam: boolean;
}

export interface HackerApplicationInstance extends Sequelize.Instance<HackerApplicationAttributes>, HackerApplicationAttributes {
  getApplicationResponse: () => Promise<ApplicationResponseInstance>;
  
  getApplicationTicket: () => Promise<ApplicationTicketInstance>;

  getHacker: () => Promise<HackerInstance>;
  hacker?: HackerInstance;
}

const attributes: SequelizeAttributes<HackerApplicationAttributes> = {
  hackerId: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
    references: {
      model: Hacker,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  applicationSlug: {
    type: Sequelize.TEXT,
    allowNull: false,
    unique: true
  },
  cv: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  developmentRoles: {
    type: Sequelize.ARRAY(Sequelize.TEXT),
    allowNull: false,
  },
  learningGoal: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  interests: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  recentAccomplishment: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  countryTravellingFrom: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  links: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  inTeam: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  wantsTeam: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
};

const HackerApplication =
  db.define<HackerApplicationInstance, HackerApplicationAttributes>('hackerApplication', attributes, {
    tableName: 'hackers-applications'
  });

HackerApplication.belongsTo(Hacker);
Hacker.hasOne(HackerApplication);

export default HackerApplication;
