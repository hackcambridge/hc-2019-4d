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
        $socialContent.text(status.text);
        $socialItem.find('.live-social-feed-item-content').append($socialTitle).append($socialContent);
        
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
