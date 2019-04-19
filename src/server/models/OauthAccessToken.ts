import * as moment from 'moment';
import * as Sequelize from 'sequelize';
import { Model } from 'sequelize';

import { Admin } from './Admin';
import db from './db';

export class OauthAccessToken extends Model {
  public id?: number;
  public token?: string;
  public expiresOn?: Date;
  public adminId: number;

  public admin?: Admin;

  public static getAdminFromTokenString(tokenString: string) {
    return OauthAccessToken.findOne({
      include: [
        {
          model: Admin,
          required: true,
        },
      ],
      where: {
        token: tokenString,
      },
    }).then(token => {
      if (!token) {
        return null;
      }

      return token.admin;
    });
  }
}

OauthAccessToken.init({
  token: {
    type: Sequelize.UUID,
    unique: true,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
  },
  expiresOn: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: () => moment().add(2, 'months').toDate(),
  },
  adminId: {
    allowNull: false,
    type: Sequelize.INTEGER,
  },
}, {
  sequelize: db,
  modelName: 'oauthAccessToken',
  tableName: 'oauth-access-token',
});

OauthAccessToken.belongsTo(Admin);
