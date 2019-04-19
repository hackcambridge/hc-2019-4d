import * as Sequelize from 'sequelize';
import { Model } from 'sequelize';

import { ApplicationResponse } from './ApplicationResponse';
import { ApplicationReview } from './ApplicationReview';
import { ApplicationTicket } from './ApplicationTicket';
import db from './db';
import { Hacker } from './Hacker';

export class HackerApplication extends Model {
  public id?: number;
  public hackerId: number;
  public applicationSlug: string;
  public cv: string;
  public developmentRoles: string[];
  public learningGoal: string;
  public interests: string;
  public recentAccomplishment: string;
  public countryTravellingFrom: string;
  public links: string;

  /** Boolean for if the hacker said they wanted to make a team application */
  public inTeam: boolean;
  public wantsTeam: boolean;
  public graduationDate: Date;
  public wantsMailingList: boolean;
  public needsVisa: boolean;
  public visaNeededBy?: Date;
  public otherInfo?: string;

  /** Whether the application is withdrawn.  For example, the hacker has told us they want to withdraw,
   *  or they are ineligible for the event.
   */
  public isWithdrawn?: boolean;

  public getApplicationResponse: () => Promise<ApplicationResponse>;
  public applicationResponse?: ApplicationResponse;
  public applicationReviews?: ApplicationReview[];
  public getApplicationTicket: () => Promise<ApplicationTicket>;
  public getHacker: (data?: { transaction: Sequelize.Transaction }) => Promise<Hacker>;
  public hacker?: Hacker;
}

HackerApplication.init({
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
}, {
  sequelize: db,
  modelName: 'hackerApplication',
  tableName: 'hackers-applications',
});

HackerApplication.belongsTo(Hacker);
Hacker.hasOne(HackerApplication);
