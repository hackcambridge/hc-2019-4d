import * as fs from 'fs';
import * as path from 'path';

import { HackerApplication } from 'server/models';
import { DecidedResponseStatus, setResponseForApplicationWithChecks } from 'server/review/response-logic';
import { ResponseStatus } from 'shared/status-constants';
import { createHandler } from './utils';

const responseTypeMap: { [type: string]: DecidedResponseStatus } = {
  invite: ResponseStatus.INVITED,
  reject: ResponseStatus.REJECTED,
};

function processIndividualApplication(applicationId, responseType: DecidedResponseStatus) {
  return HackerApplication.findById(applicationId)
    .then(application => {
      if (application == null) {
        console.log(`Application ${applicationId} not found`);
        return Promise.resolve();
      }

      return setResponseForApplicationWithChecks(application, responseType)
        .then(_applicationResponse => {
          console.log(`Application response sent for application ${application.id}.`);
        }, error => {
          console.error(`Failed to send response for application ${application.id}.`);
          console.error(error);
        });
    });
}

/**
 * This function will mutate the applications queue
 */
function processResponseQueue(applications, responseType: DecidedResponseStatus) {
  if (applications.length === 0) {
    return Promise.resolve();
  }

  const application = applications.pop();

  return processIndividualApplication(application.id, responseType)
    .then(() => {
      return processResponseQueue(applications, responseType);
    });
}

export default {
  command: 'respond <type> <inputfile>',
  desc: 'Takes a set of applications from a file and responds to them',
  aliases: [],
  builder(yargs) {
    return yargs;
  },
  handler: createHandler(({ type, inputfile }) =>
    processResponseQueue(
      JSON.parse(fs.readFileSync(path.resolve(process.cwd(), inputfile)).toString()),
      responseTypeMap[type]
    ).then(() => {
      console.log('Done!');
    })
  ),
};
