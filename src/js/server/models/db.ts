import * as Sequelize from 'sequelize';

import * as databaseConfig from 'js/../../db/config.js';

export default new Sequelize(databaseConfig[process.env.NODE_ENV]);
