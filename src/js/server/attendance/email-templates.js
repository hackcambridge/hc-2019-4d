const { makeInstruction } = require('js/server/email');

function teamKeyFromMember(member) {
  return { [`${member.firstName} ${member.lastName}`]: `${member.email} (${member.slackName ? `Slack name: ${member.slackName}` : 'You haven\'t signed up for Slack yet!'})` };
}

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
  expiry({ name, daysValid }) {
    return {
      subject: 'Your Hack Cambridge invitation has expired',
      body: {
        name,
        intro: [
          `Earlier we sent you an invitation to Hack Cambridge Recurse with ${daysValid} days to respond. We have not received a response from you and your invitation has expired.`,
          'We hope to see you apply for the next Hack Cambridge!'
        ],
        outro: 'If you have any questions, please reach out to us by visiting our website.',
      }
    }
  },
  teamAllocation({ team }) {
    const teamDictionary = team.reduce((partialTeam, member) => 
      Object.assign(partialTeam, teamKeyFromMember(member)),
      { }
    );

    return {
      subject: 'We\'ve put a team together for you for Hack Cambridge',
      body: {
        name: 'Hackers',
        intro: [
          'When you applied for Hack Cambridge you let us know that you wanted us to suggest you a team.',
          'We\'ve done ths now, and here are everyone\'s details.',
        ],
        dictionary: teamDictionary,
        outro: [
          'Start the conversation by hitting reply all! Please exclude us from that email.',
          'This is just a suggestion, it is not binding, you can enter whatever team you like at Hack Cambridge.',
          'If you have any questions, please reach out to us by visiting our website.',
        ]
      }
    }
  }
};

