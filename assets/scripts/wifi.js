var $ = require('jquery');

module.exports = function () {
  $('.wifi-form').each(function () {
    var $this = $(this);
    var loading = null;
    var $output = $this.find('.payment-form-output');
    
    var data = $this.serializeArray();

    $this.submit(function (e) {
      e.preventDefault();

      if (loading != null) {
        return;
      }
      var data = $this.serializeArray();

      loading = $.ajax('/api/wifi', {
        method: 'POST',
        data: data
      })
      .success(function (data) {
        $('.wifi-form').remove();
        $('.wifi-form-description').html(data.message);
      })
      .fail(function (jqXHR) {
        var errormsg = ((jqXHR.responseJSON) && (jqXHR.responseJSON.error)) ? jqXHR.responseJSON.error : 'Something went wrong. Please try again.';
        $output.text(errormsg);
        $this.find('input, button').prop('disabled', false);
      })
      .always(function () {
        loading = null;
      });

      $this.find('input, button').prop('disabled', true);
    });
  });
};
