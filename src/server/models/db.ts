import * as Sequelize from 'sequelize';

import { getConfigPath } from '../../../db/configManager';

const dbConfig = require(getConfigPath());
export default new Sequelize(dbConfig[process.env.NODE_ENV ? process.env.NODE_ENV : 'development']);
