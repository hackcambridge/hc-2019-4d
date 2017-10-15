const path = require('path');

require('dotenv').load({ path: path.resolve(__dirname, '..', '.env') });

module.exports = {
  development: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    dialect: 'postgres',
  },
};
