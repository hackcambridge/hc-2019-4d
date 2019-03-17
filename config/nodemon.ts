import * as dotenv from 'dotenv';

dotenv.load();

export const nodemonConfig = {
  script: 'dist/index.js',
  ext: 'js',
  env: {
    NODE_PATH: './dist',
    NODE_ENV: process.env.NODE_ENV,
  },
  done: null,
  watch: ['dist/'],
  verbose: false,
}
