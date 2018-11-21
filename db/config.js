const path = require('path');

require('dotenv').load({ path: path.resolve(__dirname, '..', '.env') });

module.exports = {
  development: {
    username: 'postgres',
    password: '',
    database: 'hack-cambridge-development',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  test: {
    username: 'postgres',
    password: '',
    database: 'hack-cambridge-test',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  production: {
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'hack-cambridge-production',
    host: process.env.PGHOST || '127.0.0.1',
    dialect: 'postgres'
  }
};
