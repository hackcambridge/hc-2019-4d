import { makeInstruction } from 'js/server/email';
import * as metadata from 'js/shared/metadata';
import { getHackathonStartDate } from '../../shared/dates';

export function invited({ name, daysValid }) {
  return {
    subject: `${name}, you are invited to ${metadata.eventTitle}!`,
    body: {
      name,
      intro: [
        `We\'ve been blown away by your application for ${metadata.title} and we want you in the city in 2018 to create something amazing.`,
        `To guarantee your place in the hackathon, we'll need confirmation that you'll be attending within ${daysValid} days of you being invited. Otherwise, you may lose your spot. Simply let us know by RSVPing.`,
        'You probably have lots of questions about travel and accommodation, among other things. All of this information is on your dashboard and you can let us know if you have any more questions.',
      ],
      action: [
        makeInstruction({
          instructions: 'Let us know whether you will be attending or not on your dashboard. You will receive your tickets after you accept. Not to worry if you turn it down, we will give your ticket to someone else.',
          button: {
            text: 'RSVP on my Dashboard',
            link: 'https://hackcambridge.com/apply/dashboard',
          },
        }),
      ],
      outro: 'If you have any questions or concerns, don\'t hesitate to reach out to us by visiting our website.',
    },
  };
}

export function notInvited({ name }) {
  return {
    subject: `An update on your ${metadata.title} application`,
    body: {
      name,
      intro: [
        `You sent an application to build with us at ${metadata.title} in January. Unfortunately, we were unable to reserve you a place at the hackathon.`,
        'We received a large number of applicants from amazing people all over the world and as much as we\'d like to, we can\'t offer everyone a spot this year.',
        'Due to the amount of them, we are unable to provide feedback on individual applications.',
        `Please stay tuned and apply for ${metadata.title} ${getHackathonStartDate().add(1, 'year').format('YYYY')} when it rolls around — we would love to hear from you again!`,
      ],
      
    },
  };
}
