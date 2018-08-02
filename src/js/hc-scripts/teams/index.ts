export default {
  command: 'teams',
  desc: 'Operate on teams',
  aliases: [],
  builder(yargs) {
    return yargs
      .command(require('./get'))
      .command(require('./add-member'))
      .command(require('./suggest'))
      .command(require('./send'))
      .demand(1);
  },
  handler: () => { },
};
