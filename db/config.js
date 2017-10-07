const path = require('path');

try {
  require('dotenv').load({ path: path.resolve(__dirname, '..', '.env') });
} catch (e) {
  // TODO: error ignored — can we handle it?
}

module.exports = {
  development: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    dialect: 'postgres',
  },
};
