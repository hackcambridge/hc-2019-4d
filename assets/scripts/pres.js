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
      viewer: $container.find('.event-viewer')
    }

    this.bounds = {
      viewer: calculateSizes(this.$elements.viewer)
    }

    this.resize();

    $(window).on('resize', this.resize.bind(this));
  }

  resize() {
    this.bounds.container = calculateSizes(this.$elements.container);

    var scaleThrough = 'width';

    // Container is wider than viewer, scale by height
    if (this.bounds.container.aspect > this.bounds.viewer.aspect) {
      scaleThrough = 'height';
    }

    var scale = this.bounds.container[scaleThrough] / this.bounds.viewer[scaleThrough];
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
      } else if (id != data.id) {
        location.reload(true);
      }
    });
  }
}

module.exports = function () {
  if ($('.event-viewer').length != 0) {
    var viewer = new Viewer($('.event-viewer-container'));
  }
};
