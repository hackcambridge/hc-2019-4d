const yargs = require('yargs');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at: Promise', promise, 'reason', reason);
});

yargs
  .command(require('./create-admin'))
  .command(require('./create-token'))
  .command(require('./suggest-responses'))
  .command(require('./respond'))
  .help()
  .argv;
