import { makeInstruction } from 'js/server/email';
import * as metadata from 'js/shared/metadata';
import { TeamMemberDetails } from './team-logic';

function teamKeyFromMember(member: TeamMemberDetails) {
  return { [`${member.firstName} ${member.lastName}`]: `${member.email} (${member.slackName ? `Slack name: ${member.slackName}` : 'You haven\'t signed up for Slack yet!'})` };
}

export function newTicket({ name }: { name: string }) {
  return {
    subject: `${name}, here are your ${metadata.title} tickets`,
    body: {
      name,
      intro: [
        `You\'ve confirmed your place at ${metadata.eventTitle}. Here\'s your ticket!`,
        'Well, this email isn\'t your actual ticket, we will know who you are because you have to bring photo ID with you to registration.',
      ],
      action: [
        makeInstruction({
          instructions: 'All the information about registration, accommodation, travel and more is on your dashboard. Have a good read - there may be some extra steps for you.',
          button: {
            text: 'Go to my Dashboard',
            link: 'https://hackcambridge.com/apply/dashboard',
          },
        })
      ],
      outro: 'If you have any questions or concerns, don\'t hesitate to reach out to us by visiting our website.',
    },
  };
}

export function expiry({ name, daysValid }: { name: string, daysValid: number }) {
  return {
    subject: `Your ${metadata.title} invitation has expired`,
    body: {
      name,
      intro: [
        `Earlier we sent you an invitation to ${metadata.eventTitle} with ${daysValid} days to respond. We have not received a response from you and your invitation has expired.`,
        `We hope to see you apply for the next ${metadata.title}!`
      ],
      outro: 'If you have any questions, please reach out to us by visiting our website.',
    }
  };
}

export function teamAllocation({ team }: { team: TeamMemberDetails[] }) {
  const teamDictionary = team.reduce((partialTeam, member) => 
    Object.assign(partialTeam, teamKeyFromMember(member)),
  { }
  );

  return {
    subject: `We\'ve put a team together for you for ${metadata.title}`,
    body: {
      name: 'Hackers',
      intro: [
        `When you applied for ${metadata.title}, you let us know that you wanted us to suggest a team for you.`,
        'We\'ve done this now, and here are everyone\'s details:',
      ],
      dictionary: teamDictionary,
      outro: [
        'Start the conversation by hitting reply all! Please exclude us from that email.',
        `This is just a suggestion, it is not binding, you can enter whatever team you like at ${metadata.title}.`,
        'If you have any questions, please reach out to us by visiting our website.',
      ]
    }
  };
}

