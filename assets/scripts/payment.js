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
          $token.val(token.id)
          $output.text("Working...");

          loading = $.ajax('/api/payment', {
            method: 'POST',
            data: $this.serialize()
          })
          .success(function (data) {
            $output.text(data.message);
          })
          .fail(function (jqXHR) {
            var errormsg = ((jqXHR.responseJSON) && (jqXHR.responseJSON.error)) ? jqXHR.responseJSON.error : 'Something went wrong. Please try again.';
            $output.text(errormsg);
          })
          .always(function () {
            loading = null;
            $this.find('input, button').prop('disabled', false);
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

        // Compensate for (kind of arbitrary) 3% surcharge
        return amount / 0.97;
      };

      $amount.on('change input', function () {
        console.log('Eh');
        var amount = getAmount();
        $this.find('.payment-surcharge').html('You Pay: <strong>£' + amount.toFixed(2) + '</strong>');
      });

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
      })
      console.log('Blah');
    })
  }
};
