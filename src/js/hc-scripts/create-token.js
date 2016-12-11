const { Admin, OauthAccessToken } = require('js/server/models');
const yargs = require('yargs');
const { createHandler } = require('./utils');

module.exports = {
  command: 'create-token <email>',
  desc: 'Create an oauth token for an admin',
  aliases: [],
  builder(yargs) {
    return yargs;
  },
  handler: createHandler(({ email }) =>
    Admin.findOne({ where: { email }})
      .then(admin => {
        if (!admin) {
          throw new Error(`No admin found with email ${email}`);
        }

        return admin;
      })
      .then(admin => OauthAccessToken.create({ adminId: admin.id }))
      .then(token => console.log(`New access token: ${token.token}`))
  ),
};
