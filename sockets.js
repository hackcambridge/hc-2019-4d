var socketio = require('socket.io');
var utils = require('./utils.js')

/**
 * Handle all of our socket connections
 */
module.exports = function (server) {
  io = socketio(server);

  var viewer = io.of('/view');

  viewer.on('connection', function (socket) {
    socket.emit('welcome', { id: utils.getPublicId() });
  });
};
