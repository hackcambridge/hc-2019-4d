import { Admin } from 'js/server/models';
import { createHandler } from './utils';

export default {
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
