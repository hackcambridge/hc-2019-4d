import * as Sequelize from 'sequelize';

import { ApplicationResponseInstance } from './ApplicationResponse';
import { ApplicationReviewInstance } from './ApplicationReview';
import { ApplicationTicketInstance } from './ApplicationTicket';
import db from './db';
import Hacker from './Hacker';
import { HackerInstance } from './Hacker';

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
  /** Boolean for if the hacker said they wanted to make a team application */
  inTeam: boolean;
  wantsTeam: boolean;
  graduationDate: Date;
  wantsMailingList: boolean;
  needsVisa: boolean;
  visaNeededBy?: Date;
  otherInfo?: string;
  /** Whether the application is withdrawn.  For example, the hacker has told us they want to withdraw,
   *  or they are ineligible for the event.
   */
  isWithdrawn?: boolean;
}

export interface HackerApplicationInstance extends Sequelize.Instance<HackerApplicationAttributes>, HackerApplicationAttributes {
  getApplicationResponse: () => Promise<ApplicationResponseInstance>;
  applicationResponse?: ApplicationResponseInstance;
  applicationReviews?: ApplicationReviewInstance[];
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
  graduationDate: {
    type: Sequelize.DATE,
    allowNull: false
  },
  wantsMailingList: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  needsVisa: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  visaNeededBy: {
    type: Sequelize.DATE,
    allowNull: true
  },
  otherInfo: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  isWithdrawn: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  }
};

const HackerApplication =
  db.define<HackerApplicationInstance, HackerApplicationAttributes>('hackerApplication', attributes, {
    tableName: 'hackers-applications'
  });

HackerApplication.belongsTo(Hacker);
Hacker.hasOne(HackerApplication);

export default HackerApplication;
