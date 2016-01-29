var socket = require('socket.io-client');
var $ = require('jquery');

module.exports = function () {
  if ($('.event-viewer').length != 0) {
    var id = null;
    var io = socket('/view');

    io.on('connect', function () {
      console.log('Connection Successful');
    });

    io.on('welcome', function (data) {
      if (id == null) {
        id = data.id;
      } else if (id != data.id) {
        location.reload(true);
      }
    });
  }
};
