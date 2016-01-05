var $ = require('jquery');

module.exports = function () {
  if ('StripeCheckout' in window) {
    var stripeConfig = window.stripeConfig;

    $('.payment-form').each(function () {
      var $this = $(this);
      var loading = null;

      var stripeHandler = StripeCheckout.configure({
        key: stripeConfig.key,
        image: stripeConfig.image,
        locale: 'auto',
        currency: 'GBP',
        token: function (token) {
          console.log("TOKEN");
          $output.text("Working...");

          var data = $this.serializeArray();

          data.push({ name: 'token', value: token.id });
          data.push({ name: 'email', value: token.email });

          loading = $.ajax('/api/payment', {
            method: 'POST',
            data: data
          })
          .success(function (data) {
            $('.payment-form').remove();
            $('.payment-form-description').text(data.message);
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
        }
      });

      var $amount = $this.find('.payment-form-amount');
      var $reference = $this.find('.payment-form-reference');
      var $token = $this.find('.payment-form-token');
      var $output = $this.find('.payment-form-output');
      var action = $this.attr('action');

      var getAmount = function () {
        var amount = $amount.val();

        if (isNaN(amount)) {
          return 0;
        }

        return amount;
      };

      $this.submit(function (e) {
        e.preventDefault();

        if (loading != null) {
          return;
        }

        var amount = Math.round(getAmount() * 100);
        var reference = $reference.val();

        if (amount == 0) {
          return;
        }

        if (reference === '') {
          return;
        }

        stripeHandler.open({
          name: 'Hack Cambridge',
          description: 'Payment: ' + reference,
          amount: amount
        });
      });
    });
  }
};
