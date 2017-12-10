import aws = require('aws-sdk');
import crypto = require('crypto');
import express = require('express');
import multer = require('multer');
import multerS3 = require('multer-s3');

import { maxFieldSize } from 'js/shared/apply/application-form';

const s3 = new aws.S3(new aws.Config({
  region: 'eu-west-1'
}));

interface IFileUpload {
  none(): express.RequestHandler;
  single(fieldName?: string): express.RequestHandler;
}

/**
 * Middleware that will upload a given CV to S3 in PDF format
 */
const fileUpload: IFileUpload = multer({
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

export default fileUpload;
