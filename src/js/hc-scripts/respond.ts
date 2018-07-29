import * as fs from 'fs';
import * as path from 'path';

import { createHandler } from './utils';
import { response } from 'js/shared/status-constants';
import { setResponseForApplicationWithChecks } from 'js/server/review/response-logic';
import { HackerApplication } from 'js/server/models';

const responseTypeMap = {
  invite: response.INVITED,
  reject: response.REJECTED,
};

function processIndividualApplication(applicationId, responseType) {
  return HackerApplication.findById(applicationId)
    .then(application => {
      if (application == null) {
        console.log(`Application ${applicationId} not found`);
        return Promise.resolve();
      }

      return setResponseForApplicationWithChecks(application, responseType)
        .then(applicationResponse => {
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
function processResponseQueue(applications, responseType) {
  if (applications.length === 0) {
    return Promise.resolve();
  }

  const application = applications.pop();
  
  return processIndividualApplication(application.id, responseType)
    .then(() => {
      return processResponseQueue(applications, responseType);
    });
}

module.exports = {
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