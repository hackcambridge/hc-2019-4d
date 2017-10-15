const Sequelize = require('sequelize');
const moment = require('moment');
const db = require('./db');
const Admin = require('./Admin');

const OauthAccessToken = module.exports = db.define('oauthAccessToken', {
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

module.exports = OauthAccessToken;
