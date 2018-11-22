import * as Sequelize from 'sequelize';
export default new Sequelize(require('js/../../db/config.js')[process.env.NODE_ENV]);
