import { Config as AwsConfig, S3 } from 'aws-sdk';
import { randomBytes } from 'crypto';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';

const s3 = new S3(new AwsConfig({
  region: 'eu-west-1'
}));

export const storage = multerS3({
  s3: s3 as any,
  bucket: process.env.S3_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key(_req, _file, callback) {
    callback(null, randomBytes(256).toString('hex'));
  }
});

export function s3Upload(options) {
  return multer({
    storage,
    limits: {
      fields: options.maxFields || 30,
      fileSize: options.maxFileSize || 1024 * 1024 * 2,
    },
    fileFilter(_req, file, callback) {
      if (!file) {
        callback(new Error(options.missing.error), false);
      } else if (!(file.mimetype === options.mediaType.type)) {
        callback(new Error(options.mediaType.error), false);
      } else {
        callback(null, true);
      }
    },
  });
}
