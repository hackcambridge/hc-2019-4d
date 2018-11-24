import { makeInstruction } from 'server/email';
import { HackerInstance } from 'server/models';
import * as metadata from 'shared/metadata';

export function applied({name, applicationSlug, inTeam}) {
  const actions = [
    makeInstruction({
      instructions: `Your application ID is ${applicationSlug}. View the status of your application on your dashboard.`,
      button: {
        text: 'Go to my Dashboard',
        link: 'https://hackcambridge.com/apply/dashboard',
      },
    }),
  ];

  if (inTeam) {
    actions.push(makeInstruction({
      instructions:
       'You applied as part of a team. This means we can\'t process your application until you\'ve been entered ' +
       'into a team application form. Once all of your team members have applied, one of you will have to enter ' +
       'the team application form.',
      button: {
        text: 'Team Application Form',
        link: 'https://hackcambridge.com/apply/team',
      },
    }));
  }

  return {
    subject: `You have applied to ${metadata.eventTitle}!`,
    body: {
      name,
      intro: [
        `Thanks for applying to ${metadata.title}! We are so excited by all of the amazing people who want to come ` +
        'to our event this January.',
        'We will be reviewing your application soon, and will let you know as soon as we have made a decision.',
      ],
      action: actions,
      outro: 'If you have any questions or concerns in the meantime, don\'t hesitate to reach out to us by visiting ' +
        'our website.',
    },
  };
}

export function userLeftTeamEmail(recipient: HackerInstance, leaving: HackerInstance) {
  return {
    subject: 'A hacker has left the team',
    body: {
      name: recipient.firstName,
      intro: [
        `${leaving.firstName} ${leaving.lastName} has decided to leave your team.`
      ],
      outro: 'If you have any questions or concerns in the meantime, don\'t hesitate to reach out to us by visiting our website.'
    }
  };
}

export function invitationToApplyEmail(recipient: string, from: HackerInstance) {
  // Application action
  const actions = [
    makeInstruction({
      instructions: `${from.firstName} ${from.lastName} tried to add you to their Hack Cambridge team, but you haven't applied yet.`,
      button: {
        text: 'Apply to Hack Cambridge 2019',
        link: 'https://hackcambridge.com/apply/',
      },
    })
  ];

  return {
    subject: 'Apply for Hack Cambridge 2019!',
    intro: 'Somebody wants you to be a member of their team for Hack Cambridge 2019!',
    body: {
      // Don't have recipient name, currently using their email
      name: recipient,
      action: actions,
      outro: 'If you have any questions or concerns in the meantime, don\'t hesitate to reach out to us by visiting our website.'
    }
  };
}

export function invitationToJoinEmail(recipient: HackerInstance, from: HackerInstance) {
  // Join a team action
  const actions = [
    makeInstruction({
      instructions: `${from.firstName} ${from.lastName} added you to their Hack Cambridge 2019 Team!`,
      button: {
        text: 'Visit your Dashboard',
        link: 'https://hackcambridge.com/apply/dashboard',
      },
    })
  ];

  return {
    subject: 'Apply for Hack Cambridge 2019!',
    intro: 'Somebody wants you to be a member of their team for Hack Cambridge 2019!',
    body: {
      // Don't have recipient name, currently using their email
      name: recipient.firstName,
      action: actions,
      outro: 'If you have any questions or concerns in the meantime, don\'t hesitate to reach out to us by visiting our website.'
    }
  };
}

export function userRemovedEmail(removed: HackerInstance, recipient: HackerInstance, remover: HackerInstance) {
  // Change the content depending if the email is going to the removed member or not
  let mainString;
  if (removed.email === recipient.email) {
    mainString = `${remover.firstName} ${remover.lastName} has removed you from the team.`;
  } else {
    mainString = `${remover.firstName} ${remover.lastName} has removed ${removed.firstName} ${removed.lastName} from the team.`;
  }
  return {
    subject: 'Hack Cambridge Team Member Removed',
    intro: [
      'Someone has been removed from your Hack Cambridge 2019 team.',
      mainString
    ],
    body: {
      name: recipient.firstName,
      outro: 'If you have any questions or concerns in the meantime, don\'t hesitate to reach out to us by visiting our website.'
    }
  };
}
