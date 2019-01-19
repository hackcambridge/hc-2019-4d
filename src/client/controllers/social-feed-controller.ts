import * as Pusher from 'pusher-js';
import { Controller } from 'stimulus';

export default class SocialFeedController extends Controller {
  /**
   * Social feed elements
   */
  public imageTarget: HTMLElement;
  public titleTarget: HTMLElement;
  public contentTarget: HTMLElement;

  static get targets() {
    return ['image', 'title', 'content'];
  }

  public connect() {
    const pusher = new Pusher(this.data.get('pusherKey'), {
      encrypted: true,
      cluster: 'eu',
    });
    let lastStatusId = null;
    pusher.subscribe('live-updates').bind('social', data => {
      if (data.statuses[0].id_str !== lastStatusId) {
        lastStatusId = data.statuses[0].id_str;
        this.cycleFeedItems(data.statuses);
      }
    });
  }

  public cycleFeedItems(statuses) {
    let i = 0;
    this.setFeedItem(statuses[i]);
    setInterval(() => {
      i + 1 < statuses.length ? i++ : i = 0;
      this.setFeedItem(statuses[i]);
    }, 30000);
  }

  public setFeedItem(status) {
    this.titleTarget.innerText = status.username;
    this.contentTarget.innerText = status.text.split(' ').slice(0, -1).join(' ');
    if (status.image) {
      this.imageTarget.setAttribute('src', status.image);
    }
  }

}
