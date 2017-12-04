module.exports = {
  command: 'teams',
  desc: 'Operate on teams',
  aliases: [],
  builder(yargs) {
    return yargs
      .command(require('./get'))
      .command(require('./suggest'))
      .command(require('./send'))
      .demand(1);
  },
  handler: () => { },
};
