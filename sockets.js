var socketio = require('socket.io');
var utils = require('./utils.js');

/**
 * Handle all of our socket connections
 */
module.exports = function (server) {
  io = socketio(server);

  // Change heartbeat to 40s - within Heroku's 55s limit
  io.set('heartbeat interval', 40000);

  var viewer = io.of('/view');

  viewer.on('connection', function (socket) {
    socket.emit('welcome', { id: utils.getPublicId() });
  });
};
