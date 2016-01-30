var $ = require('jquery');
var pep = require('pepjs');
var socket = require('socket.io-client');

module.exports = function () {
  console.log(pep);
  $('.touch-container').each(function () {
    var $container = $(this);
    var $canvas = $(this).find('.touch-viewer');
    var canvas = $canvas[0];
    var io = socket.connect('/touch');
    var pointers = [];
    var devicePixelRatio
    var width;
    var height;

    var resize = function (e) {
      width = $container.width();
      height = $container.height();

      devicePixelRatio = window.devicePixelRatio || 1;

      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;

      pointers = [];
    }

    var draw = function () {
      var ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);


      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 6 * devicePixelRatio;

      for (var i in pointers) {
        var pointer = pointers[i];
        if (pointer) {
          ctx.beginPath();
          ctx.arc(pointer.x * canvas.width, pointer.y * canvas.height, 20 * devicePixelRatio, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      requestAnimationFrame(draw);
    };

    var zeroed = true;
    var sendPointers = function () {
      var pointersToSend = [];
      for (var i in pointers) {
        if (pointers[i]) {
          var pointer = pointers[i];
          pointersToSend.push([pointer.x,pointer.y,i]);
        }
      }

      if ((pointersToSend.length > 0) || (!zeroed)) {
        io.emit('pointers', pointersToSend);
      }

      zeroed = (pointersToSend.length == 0);
    };

    setInterval(sendPointers, 50)

    resize();
    requestAnimationFrame(draw);

    $(window).resize(resize);

    $container.on('pointerdown', function (e) {
      var p = e.originalEvent;

      pointers[p.pointerId] = {
        x: p.x / width,
        y: p.y / height
      };
    });

    $container.on('pointermove', function (e) {
      var p = e.originalEvent;
      var pointer = pointers[p.pointerId];

      if (pointer) {
        pointer.x = p.x / width;
        pointer.y = p.y / height;
      }
    });

    $container.on('pointerup', function (e) {
      var p = e.originalEvent;
      var pointer = pointers[p.pointerId];

      if (pointer) {
        delete pointers[p.pointerId];
      }

    });
  });
};
