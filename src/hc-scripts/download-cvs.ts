import * as fs from 'fs';
import * as https from 'https';
import * as _ from 'lodash';
import * as path from 'path';

import { getAllApplicationsWithTickets } from 'server/attendance/attendee-info';
import { HackerApplicationInstance } from 'server/models';
import { createHandler } from './utils';

const simultaneousRequests = 10;

function downloadCv(application: HackerApplicationInstance, destPath: string) {
  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(destPath);

    const request = https.get(application.cv, response => {
      response.pipe(dest);
      dest.on('finish', resolve);
    });

    request.on('error', error => {
      fs.unlink(destPath, () => undefined);
      reject(`Could not download CV for application ID ${application.id} (error ${error})`);
    });
  });
}

async function downloadCvs(basePath: string): Promise<void> {
  const applicationsWithTickets = await getAllApplicationsWithTickets();
  const shuffledApplications = _.shuffle(applicationsWithTickets);
  const cvPromiseFunctions = shuffledApplications.map((application, i) => {
    const destPath = path.resolve(process.cwd(), basePath, `Hack Cambridge CV ${i + 1}.pdf`);
    return (() => downloadCv(application, destPath));
  });

  for (let i = 0; i < cvPromiseFunctions.length; i += simultaneousRequests) {
    const promiseFunctionChunk = cvPromiseFunctions.slice(i, i + simultaneousRequests);
    console.log(`Downloading CVs ${i + 1} to ${i + promiseFunctionChunk.length}...`);
    await Promise.all(promiseFunctionChunk.map(promiseFunc => promiseFunc()));
  }
}

export default {
  command: 'download-cvs <outputfolder>',
  desc: 'Downloads CVs for ticketed hackers to a folder',
  aliases: [],
  builder(yargs) {
    return yargs;
  },
  handler: createHandler(async ({ outputfolder }: { outputfolder: string }) => {
    try {
      await downloadCvs(outputfolder);
    } catch (err) {
      console.log('Failed to download CVs. ' + err);
    }
  })
};
