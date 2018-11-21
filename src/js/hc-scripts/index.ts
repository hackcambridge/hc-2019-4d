import * as dotenv from 'dotenv';
import * as yargs from 'yargs';
import createAdmin from './create-admin';
import createToken from './create-token';
import downloadCvs from './download-cvs';
import expireInvitations from './expire-invitations';
import respond from './respond';
import suggestResponses from './suggest-responses';
import teams from './teams';
import unfinishedApplications from './unfinished-applications';

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
