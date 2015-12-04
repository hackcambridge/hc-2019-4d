var deadline = new Date(Date.UTC(2015, 11, 5, 0, 0, 0));
var deadlineTime = deadline.getTime();
var nbsp = '\u00a0';

function formatTime(raw, processed, factor, text) {
  var newRaw = (raw - processed) * factor;
  var val = Math.floor(newRaw);

  return {
    raw: newRaw,
    val: val,
    text: val + nbsp + text + (val == 1 ? '' : 's')
  }
}

module.exports = function createCountdownText(html) {
  var now = new Date();
  var nowTime = now.getTime();

  var difference = Math.max(0, deadlineTime - nowTime);
  if (difference == 0) {
    return 'Applications are closed.'
  }

  var hours = formatTime(difference, 0, 1 / (1000 * 60 * 60), 'Hour');
  var minutes = formatTime(hours.raw, hours.val, 60, 'Minute');
  var seconds = formatTime(minutes.raw, minutes.val, 60, 'Second');

  return 'Applications close in ' + hours.text + ', ' + minutes.text + ' and ' + seconds.text;
}
