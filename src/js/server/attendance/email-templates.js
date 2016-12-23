const { makeInstruction } = require('js/server/email');

module.exports = {
  newTicket({ name }) {
    return {
      subject: 'Here are your Hack Cambridge tickets',
      body: {
        name,
        intro: [
          'You\'ve been invited and RSVP\'d to Hack Cambridge. Here\'s your ticket!',
          'Well, this email isn\'t your actual ticket. Blah blah.',
          // TODO: Add info about registration
        ],
        outro: 'If you have any questions or concerns, don\'t hesitate to reach out to us by visiting our website.',
      },
    };
  },
};
