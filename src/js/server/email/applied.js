module.exports = function ({name, applicationId}) {
  return {
    subject: 'You have applied to Hack Cambridge: Recurse!',
    body: {
      name,
      intro: 'Thanks for applying to Hack Cambridge! You are great.',
      action: {
        instructions: `Your application ID is ${applicationId}. View the status of your application on your dashboard.`,
        button: {
          text: 'Go to my Dashboard',
          link: 'https://hackcambridge.com/apply/dashboard',
        },
      },
    },
  };
}
