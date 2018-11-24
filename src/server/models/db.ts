import * as Sequelize from 'sequelize';

import * as databaseConfig from '../../../db/config';

export default new Sequelize(databaseConfig[process.env.NODE_ENV]);
