let $ = require('jquery');

module.exports = function () {
  if ('StripeCheckout' in window) {
    let stripeConfig = window.stripeConfig;

    $('.payment-form').each(function () {
      let $this = $(this);
      let loading = null;

      let stripeHandler = StripeCheckout.configure({
        key: stripeConfig.key,
        image: stripeConfig.image,
        locale: 'auto',
        currency: 'GBP',
        token: function (token) {
          console.log('TOKEN');
          $output.text('Working...');

          let data = $this.serializeArray();

          data.push({ name: 'token', value: token.id });
          data.push({ name: 'email', value: token.email });

          loading = $.ajax('/api/payment', {
            method: 'POST',
            data: data
          })
            .success((data) => {
              $('.payment-form').remove();
              $('.payment-form-description').text(data.message);
            })
            .fail((jqXHR) => {
              let errormsg = ((jqXHR.responseJSON) && (jqXHR.responseJSON.error)) ? jqXHR.responseJSON.error : 'Something went wrong. Please try again.';
              $output.text(errormsg);
              $this.find('input, button').prop('disabled', false);
            })
            .always(() => {
              loading = null;
            });

          $this.find('input, button').prop('disabled', true);
        }
      });

      let $amount = $this.find('.payment-form-amount');
      let $reference = $this.find('.payment-form-reference');
      let $token = $this.find('.payment-form-token');
      var $output = $this.find('.payment-form-output');
      let action = $this.attr('action');

      let getAmount = function () {
        let amount = $amount.val();

        if (isNaN(amount)) {
          return 0;
        }

        return amount;
      };

      $this.submit((e) => {
        e.preventDefault();

        if (loading != null) {
          return;
        }

        let amount = Math.round(getAmount() * 100);
        let reference = $reference.val();

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
