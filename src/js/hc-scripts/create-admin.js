const { Admin } = require('js/server/models');
const yargs = require('yargs');
const { createHandler } = require('./utils');

module.exports = {
  command: 'create-admin',
  desc: 'Create a new admin user',
  aliases: [],
  builder(yargs) {
    return yargs.demand(['email', 'name']);
  },
  handler: createHandler(({ name, email }) =>
    Admin.create({ name, email })
      .then(admin => console.log('New admin created', admin.get()))
  ),
};
