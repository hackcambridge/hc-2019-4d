import * as aws from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as crypto from 'crypto';

import { maxFieldSize } from 'js/shared/apply/application-form';

const s3 = new aws.S3(new aws.Config({
  region: 'eu-west-1'
}));

/**
 * Middleware that will upload a given CV to S3 in PDF format
 */
export default multer({
  storage: multerS3({
    s3: <any>s3,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, callback) {
      callback(null, crypto.randomBytes(256).toString('hex') + '.pdf');
    }
  }),
  limits: {
    fields: 20,
    fieldSize: maxFieldSize
  },
  fileFilter(req, file, callback) {
    // At this stage, we know we are only uploading a CV in PDF. Only accept PDFs
    if (file.mimetype === 'application/pdf') {
      callback(null, true);
    }

    callback(null, false);
  },
});
