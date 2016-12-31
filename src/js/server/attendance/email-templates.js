const { makeInstruction } = require('js/server/email');

module.exports = {
  newTicket({ name }) {
    return {
      subject: `${name}, here are your Hack Cambridge tickets`,
      body: {
        name,
        intro: [
          'You\'ve confirmed your place at Hack Cambridge. Here\'s your ticket!',
          'Well, this email isn\'t your actual ticket, we will know who you are because you have to bring photo ID with you to registration.',
        ],
        action: [
          makeInstruction({
            instructions: 'All the information about registration, accomodation, travel and more is on your dashboard. Have a good read - there may be some extra steps for you.',
            button: {
              text: 'Go to my Dashboard',
              link: 'https://hackcambridge.com/apply/dashboard',
            },
          })
        ],
        outro: 'If you have any questions or concerns, don\'t hesitate to reach out to us by visiting our website.',
      },
    };
  },
};
