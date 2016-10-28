var socketio = require('socket.io');
var utils = require('./utils.js');
var moment = require('moment');
var _ = require('lodash');

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

  var touch = io.of('/touch');

  touch.on('connection', function (socket) {
    socket.touchPointers = [];
    socket.on('pointers', function (data) {
      socket.touchPointers = data;
      socket.age = moment();
    });
  });


  var emitPointers = function () {
    var pointers = [];
    _.forOwn(touch.connected, function (socket) {
      socket.touchPointers.forEach(function(pointer) {
        if (pointer) {
          // Add ID to pointer
          pointer.push(socket.id);
          pointers.push(pointer);
        }
      });
    });

    viewer.emit('pointers', pointers);
  };

  var clearPointers = function () {
    _.forOwn(touch.connected, function (socket) {
      if ((socket.age) && (moment().diff(socket.age) > 1000)) {
        socket.touchPointers = [];
      }
    });
  }

  setInterval(emitPointers, 50);
  setInterval(clearPointers, 1000);
};
