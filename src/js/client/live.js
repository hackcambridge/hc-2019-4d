const Pusher = require('pusher-js');
const $ = require('jquery');

function initialiseLive() {
  const pusher = new Pusher(window.liveConfig.pusherKey, {
    encrypted: true,
    cluster: 'eu',
  });

  const liveUpdates = pusher.subscribe('live-updates');

  $('.live-social-feed-content').each(function () {
    liveUpdates.bind('social', (data) => {
      $(this).children().remove();
      $(this).append(data.statuses.slice(0, 5).map(status => {
        const $socialItem = $('<div class="live-social-feed-item"><div class="live-social-feed-item-content"></div></div>');
        const $socialTitle = $('<h4></h4>');
        $socialTitle.text(status.username);
        const $socialContent = $('<p></p>');
        $socialContent.html(status.text);
        $socialItem.find('.live-social-feed-item-content').append($socialTitle).append($socialContent);
        if (status.image) {
          $socialItem.find('.live-social-feed-item-content').css('background-image', `linear-gradient(to top, rgba(0, 0, 0, 0.6) 0, rgba(0, 0, 0, 0.2) 200px, rgba(0, 0, 0, 0)), url(${status.image})`);
        }
        
        return $socialItem;
      }));
    });
  });
}

module.exports = () => {
  if (window.liveConfig) {
    initialiseLive();
  }
};
