var socket = require('socket.io-client');
var $ = require('jquery');

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

    io.on('pointers', (data) => {

      this.pointers = data.map((p) => ({
        x: p[0],
        y: p[1],
        id: p[2],
        from: p[3],
        dead: false,
        opacity: 0,
        color: '#fff'
      }));

      // console.log(this.pointers);
    });
  }

  _initDrawing() {
    var draw = () => {
      var ctx = this.canvas.getContext('2d');

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.pointers.forEach((p) => {
        p.newx = p.x * this.canvas.width;
        p.newy = p.y * this.canvas.height;
      });

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
