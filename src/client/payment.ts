import * as $ from 'jquery';

// Add globals for Stripe
declare global {
  interface Window {
    StripeCheckout: any;
    stripeConfig: any;
  }
}

export function start() {
  if ('StripeCheckout' in window) {
    const StripeCheckout = window.StripeCheckout;
    const stripeConfig = window.stripeConfig;

    $('.payment-form').each((_, form: HTMLFormElement) => {
      const $form = $(form);
      let loading = null;

      const stripeHandler = StripeCheckout.configure({
        key: stripeConfig.key,
        image: stripeConfig.image,
        locale: 'auto',
        currency: 'GBP',
        token(token) {
          console.log('TOKEN');
          $output.text('Working…');

          const formData = $form.serializeArray();

          formData.push({ name: 'token', value: token.id });
          formData.push({ name: 'email', value: token.email });

          loading = $.ajax('/api/payment', {
            method: 'POST',
            data: formData
          })
            .done(data => {
              $output.text(data.message);
              $('section.form-status.red').removeClass('red').addClass('black');
            })
            .fail(jqXHR => {
              const errormsg = ((jqXHR.responseJSON) && (jqXHR.responseJSON.error)) ?
                jqXHR.responseJSON.error :
                'Something went wrong. Please try again.';
              $output
                .text(errormsg + ' Please try again.')
                .append('<br>')
                .append('<a href="mailto:team@hackcambridge.com?subject=Payment issue&body=' +
                  'I have encountered this error when trying to make a payment: ' + errormsg + '">Contact us</a>');
              $('section.form-status.black').removeClass('black').addClass('red');
              $form.find('input, button').prop('disabled', false);
            })
            .always(() => {
              loading = null;
            });

          $form.find('input, button').prop('disabled', true);
        }
      });

      const $amount = $form.find('[name="amount"]');
      const $reference = $form.find('[name="reference"]');
      const $output = $('p.form-status');

      function getAmount(): number {
        const amount: number = $amount.val() as number;

        if (isNaN(amount)) {
          return 0;
        }

        return amount;
      }

      $form.submit(e => {
        e.preventDefault();

        if (loading != null) {
          return;
        }

        const amount = Math.round(getAmount() * 100);
        const reference = $reference.val();

        if (amount === 0) {
          return;
        }

        if (reference === '') {
          return;
        }

        stripeHandler.open({
          name: 'Hack Cambridge',
          description: 'Payment: ' + reference,
          amount
        });
      });
    });
  }
}
