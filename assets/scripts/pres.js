var socket = require('socket.io-client');
var $ = require('jquery');

const PHI = (1 + Math.sqrt(5)) / 2;

function calculateSizes($el) {
  return {
    width: $el.width(),
    height: $el.height(),
    aspect: $el.width() / $el.height()
  }
}

class Viewer {
  constructor($container) {
    this.$elements = {
      container: $container,
      viewer: $container.find('.event-viewer'),
      canvas: $container.find('.event-viewer-touch')
    }

    this.canvas = this.$elements.canvas[0];

    this.bounds = {
      viewer: calculateSizes(this.$elements.viewer)
    }

    this.pointers = [];

    this.resize();
    this._initSockets();
    this._initDrawing();

    $(window).on('resize', this.resize.bind(this));
  }

  resize() {
    this.bounds.container = calculateSizes(this.$elements.container);
    this.devicePixelRatio = window.devicePixelRatio || 1;

    var scaleThrough = 'width';

    // Container is wider than viewer, scale by height
    if (this.bounds.container.aspect > this.bounds.viewer.aspect) {
      scaleThrough = 'height';
    }

    var scale = this.bounds.container[scaleThrough] / this.bounds.viewer[scaleThrough];
    this.canvasScale = (window.devicePixelRatio || 1) * scale;
    this.canvas.width = this.bounds.viewer.width * this.canvasScale;
    this.canvas.height = this.bounds.viewer.height * this.canvasScale;
    this.$elements.viewer.css('transform', `scale(${scale})`);
  }

  _initSockets() {
    var id = null;
    var io = this.io = socket('/view');

    io.on('connect', function () {
      console.log('Connection Successful');
    });

    io.on('welcome', function (data) {
      if (id == null) {
        id = data.id;
        console.log(id);
      } else if (id != data.id) {
        location.reload(true);
      }
    });

    var encodeString = function (s) {
      var number = 0;
      for (var i = 0; i < s.length; i ++) {
        number += s.charCodeAt(i);
      }

      return number;
    }

    io.on('pointers', (data) => {
      this.pointers.forEach((p) => { p.dead = true; });

      // Iterate over pointers, only add new ones that don't exist
      // Otherwise just update existing ones
      data.forEach((dat) => {
        var from = dat[3];
        var hue = ((encodeString(from) % 100) + 280).toFixed(3);
        var newp = {
          x: dat[0],
          y: dat[1],
          id: dat[2],
          from: from,
          dead: false,
          opacity: 0,
          hue: hue,
          found: true
        };

        var found = this.pointers.some((p) => {
          if ((p.from == newp.from) && (p.id == newp.id)) {
            p.x = newp.x;
            p.y = newp.y;
            p.dead = false;

            return true;
          }

          return false;
        });

        if (!found) {
          this.pointers.push(newp);
        }
      });

      this.pointers = this.pointers.filter((p) => !((p.dead) && (p.opacity <= 0)));
    });
  }

  _initDrawing() {
    var draw = () => {
      var ctx = this.canvas.getContext('2d');

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (var i = 0; i < this.pointers.length; i ++) {
        var p = this.pointers[i];
        p.newx = p.x * this.canvas.width;
        p.newy = p.y * this.canvas.height;
        p.color = `hsla(${p.hue}, 100%, 50%, ${p.opacity})`;

        if (p.dead) {
          if (p.opacity > 0) {
            p.opacity -= 0.1;
          }
        } else {
          if (p.opacity < 1) {
            p.opacity += 0.1;
          }

        }
      }

      // Draw Lines
      var len = this.pointers.length;
      for (var i = 0; i < len; i ++) {
        var p1 = this.pointers[i];

        for (var n = i + 1; n < len; n ++) {
          var p2 = this.pointers[n];

          if (p1.from !== p2.from) {
            // Get squared distance adjusted for aspect ratio
            var dis = Math.pow((p1.newx - p2.newx) / this.canvas.height, 2) + Math.pow(p1.y - p2.y, 2);
            if (dis < 0.08) {
              var grad = ctx.createLinearGradient(p1.newx, p1.newy, p2.newx, p2.newy);

              grad.addColorStop(0, p1.color);
              grad.addColorStop(1, p2.color);

              ctx.strokeStyle = grad;
              ctx.lineWidth = (1 - dis / 0.08) * 2;

              ctx.beginPath();

              ctx.moveTo(p1.newx, p1.newy);
              ctx.lineTo(p2.newx, p2.newy);

              ctx.stroke();
            }
          }
        }


      }

      // Draw Touches
      this.pointers.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.newx, p.newy, 8 * this.canvasScale, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }
}

module.exports = function () {
  if ($('.event-viewer').length != 0) {
    var viewer = new Viewer($('.event-viewer-container'));
  }
};
