const { makeInstruction } = require('js/server/email');

exports.invited = function ({ name }) {
  return {
    subject: 'You are invited to Hack Cambridge Recurse!',
    body: {
      name,
      intro: [
        'We\'ve been blown away by your application for Hack Cambridge and we want you in the city in 2017 to create something amazing.',
        'To guarantee your place in the hackathon, we\'ll need confirmation that you\'ll be attending within 3 days of you being invited. Otherwise, you may lose your spot. Simply let us know by RSVPing below.',
        'Have any questions about travel reimbursement or when to arrive on the day? You\'ll find answers to that and more on your dashboard.',
      ],
      action: [
        makeInstruction({
          instructions: `Let us know whether you will be attending or not on your dashboard. You will receive your tickets after you accept. Not to worry if you turn it down, we will give your ticket to someone else.`,
          button: {
            text: 'RSVP on my Dashboard',
            link: 'https://hackcambridge.com/apply/dashboard',
          },
        }),
      ],
      outro: 'If you have any questions or concerns, don\'t hesitate to reach out to us by visiting our website.',
    },
  };
};

exports.notInvited = function ({ name }) {
  return {
    subject: 'An update on your Hack Cambridge application',
    body: {
      name,
      intro: [
        'You sent an application to build with us at Hack Cambridge in January next year. Unfortunately, we were unable to reserve you a place at the hackathon.',
        'We received a large number of applicants from amazing people all over the world and as much as we\'d like to, we can\'t offer everyone a spot.',
        'Due to the amount of them, we are unable to provide feedback on individual applications.',
        'Please stay tuned and apply for Hack Cambridge 2017 when it rolls around - we would love to hear from you again!',
      ],
      outro: 'If you have any questions, please reach out to us by visiting our website.',
    },
  };
}
