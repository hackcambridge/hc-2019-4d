const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
const { maxFieldSize } = require('js/shared/application-form');

const s3 = new aws.S3(new aws.Config({
  region: 'eu-west-1'
}));

/**
 * Middleware that will upload a given CV to S3 in PDF format
 */
module.exports = multer({
  storage: multerS3({
    s3,
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
