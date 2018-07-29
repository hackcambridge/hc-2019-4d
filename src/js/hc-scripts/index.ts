import * as dotenv from 'dotenv';
import * as yargs from 'yargs';

dotenv.load();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at: Promise', promise, 'reason', reason);
});

yargs
  .command(require('./create-admin'))
  .command(require('./create-token'))
  .command(require('./unfinished-applications'))
  .command(require('./suggest-responses'))
  .command(require('./respond'))
  .command(require('./expire-invitations'))
  .command(require('./download-cvs'))
  .command(require('./teams'))
  .demand(1, 'Supply a command.')
  .help()
  .argv;
