import { S3, Config } from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { randomBytes } from 'crypto';

const s3 = new S3(new Config({
  region: 'eu-west-1'
}));

export const storage = multerS3({
  s3: <any>s3,
  bucket: process.env.S3_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key(req, file, callback) {
    callback(null, randomBytes(256).toString('hex'));
  }
});

export function s3Upload(options) {
  return multer({
    storage: storage,
    limits: {
      fields: options.maxFields || 30,
      fileSize: options.maxFileSize
    },
    fileFilter(req, file, callback) {
      if (!(file.mimetype === options.mediaType.type)) {
        callback(new Error(options.mediaType.error), false);
      } else {
        callback(null, true);
      }
    },
  });
}
