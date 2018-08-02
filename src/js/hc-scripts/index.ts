import * as dotenv from 'dotenv';
import * as yargs from 'yargs';
import createAdmin from './create-admin';
import createToken from './create-token';
import unfinishedApplications from './unfinished-applications';
import suggestResponses from './suggest-responses';
import respond from './respond';
import expireInvitations from './expire-invitations';
import downloadCvs from './download-cvs';
import teams from './teams';

dotenv.load();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at: Promise', promise, 'reason', reason);
});

yargs
  .command(createAdmin)
  .command(createToken)
  .command(unfinishedApplications)
  .command(suggestResponses)
  .command(respond)
  .command(expireInvitations)
  .command(downloadCvs)
  .command(teams)
  .demand(1, 'Supply a command.')
  .help()
  .argv;
