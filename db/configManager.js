const fs = require('fs');
const path = require('path');

module.exports.getConfigPath = function getConfigPath() {
  const modifiedConfigPath = path.resolve('db', 'config.js');
  const distConfigPath = path.resolve('db', 'config.dist.js');
  return fs.existsSync(modifiedConfigPath) ? modifiedConfigPath : distConfigPath;
}
