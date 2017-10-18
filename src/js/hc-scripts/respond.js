const { createHandler } = require('./utils');
const { response } = require('js/shared/status-constants');
const { setResponseForApplicationWithChecks } = require('js/server/review/response-logic');
const { HackerApplication } = require('js/server/models');
const fs = require('fs');
const path = require('path');

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
      JSON.parse(fs.readFileSync(path.resolve(process.cwd(), inputfile))),
      responseTypeMap[type]
    ).then(() => {
      console.log('Done!');
    })
  ),
};