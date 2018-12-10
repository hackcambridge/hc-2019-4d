import * as dotenv from 'dotenv';
import * as yargs from 'yargs';
import createAdmin from './create-admin';
import createToken from './create-token';
import downloadCvs from './download-cvs';
import expireInvitations from './expire-invitations';
import polarisedApplications from './polarised-applications';
import respond from './respond';
import suggestResponses from './suggest-responses';
import teams from './teams';
import unfinishedApplications from './unfinished-applications';

dotenv.load();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at: Promise', promise, 'reason', reason);
});

// tslint:disable-next-line:no-unused-expression
yargs
  .command(createAdmin)
  .command(createToken)
  .command(downloadCvs)
  .command(expireInvitations)
  .command(polarisedApplications)
  .command(respond)
  .command(suggestResponses)
  .command(teams)
  .command(unfinishedApplications)
  .demand(1, 'Supply a command.')
  .help()
  .argv;
