import $ from 'jquery';

let pages = [
  require('./apply'),
  require('./live'),
  require('./payment'),
  require('./splash')
];

$(document).ready(() => {
  pages.forEach((f) => f());
});
