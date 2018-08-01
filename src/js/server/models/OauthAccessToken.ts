import * as Sequelize from 'sequelize';
import * as moment from 'moment';

import db from './db';
import Admin from './Admin';

interface OauthAccessTokenAttributes {
  id?: number;
  token: string;
  expiresOn: Date;
  adminId: number;
}

type OauthAccessTokenInstance = Sequelize.Instance<OauthAccessTokenAttributes>
  & OauthAccessTokenAttributes;

const attributes: SequelizeAttributes<OauthAccessTokenAttributes> = {
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
};

const OauthAccessToken: any =
  db.define<OauthAccessTokenInstance, OauthAccessTokenAttributes>('oauthAccessToken', attributes, {
    tableName: 'oauth-access-tokens',
  });

OauthAccessToken.belongsTo(Admin);

OauthAccessToken.getAdminFromTokenString = function getAdminFromTokenString(token) {
  return OauthAccessToken.findOne({
    include: [
      {
        model: Admin,
        required: true,
      },
    ],
    where: {
      token,
    },
  }).then((token) => {
    if (!token) {
      return null;
    }

    return token.admin;
  });
};

export default OauthAccessToken;
