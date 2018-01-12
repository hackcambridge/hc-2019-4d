const { getAllApplicationsWithTickets } = require('js/server/attendance/attendee-info');
const { createHandler } = require('./utils');

const fs = require('fs');
const https = require('https');
const path = require('path');

const simultaneousRequests = 10;

function downloadCv(application, destPath) {
  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(destPath);

    const request = https.get(application.cv, response => {
      response.pipe(dest);
      dest.on('finish', resolve);
    });

    request.on('error', error => {
      fs.unlink(destPath);
      reject(`Could not download CV for application ID ${application.id} (error ${error})`);
    });
  });
}

function downloadCvs(basePath) {
  return getAllApplicationsWithTickets()
    .then(applicationsWithTickets => {
      const cvPromiseFunctions = applicationsWithTickets.map((application, i) => {
        const destPath = path.resolve(process.cwd(), basePath, `Hack Cambridge CV ${i+1}.pdf`);
        return (() => downloadCv(application, destPath));
      });

      let promiseChain = Promise.resolve();

      for (let i = 0; i < cvPromiseFunctions.length; i += simultaneousRequests) {
        let promiseFunctionChunk = cvPromiseFunctions.slice(i, i + simultaneousRequests);
        promiseChain = promiseChain.then(_ => {
          console.log(`Downloading CVs ${i + 1} to ${i + promiseFunctionChunk.length}...`);
          return Promise.all(promiseFunctionChunk.map(promiseFunc => promiseFunc()));
        });
      }
      
      return promiseChain;
    });
}

module.exports = {
  command: 'download-cvs <outputfolder>',
  desc: 'Downloads CVs for ticketed hackers to a folder',
  aliases: [],
  builder(yargs) {
    return yargs;
  },
  handler: createHandler(({ outputfolder }) =>
    downloadCvs(outputfolder)
      .then(_ => console.log('Done downloading CVs.'))
      .catch(reason => console.log('Failed to download CVs. ' + reason))
  ),
};
