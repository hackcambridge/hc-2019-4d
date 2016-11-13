exports.applied = function ({name, applicationSlug, inTeam}) {
  const actions = [
    {
      instructions: `Your application ID is ${applicationSlug}. View the status of your application on your dashboard.`,
      button: {
        text: 'Go to my Dashboard',
        link: 'https://hackcambridge.com/apply/dashboard',
      },
    },
  ];

  if (inTeam) {
    actions.push({
      instructions: [
       'You applied as part of a team. This means we can\'t process your application until you\'ve been entered into a team applicaiton form. ' +
       'Once all of your team members have applied, one of you will have to enter the team application form.',
      ],
      button: {
        text: 'Team Application Form',
        link: 'https://hackcambridge.com/apply/team',
      },
    });
  }

  return {
    subject: 'You have applied to Hack Cambridge: Recurse!',
    body: {
      name,
      intro: [
        'Thanks for applying to Hack Cambridge! We are so excited by all of the amazing people who want to come to our event this January',
        'We will be reviewing your application soon, and will let you know as soon as we have made a decision',
      ],
      action: actions,
      outro: 'If you have any questions or concerns in the meantime, don\'t hesitate to reach out to us by visiting our website.',
    },
  };
};
