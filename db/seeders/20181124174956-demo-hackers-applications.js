'use strict';

function generateApplication(id, applicationSlug, inTeam, needsVisa) {
  let app = {
    id,
    hackerId: id,
    createdAt: new Date(),
    updatedAt: new Date(),
    applicationSlug,
    cv: 'https://hackcambridge.com',
    developmentRoles: ['development'],
    learningGoal: 'Learn things',
    interests: 'Interesting',
    recentAccomplishment: 'Nothing',
    countryTravellingFrom: 'GB',
    links: 'https://github.com/',
    /** Boolean for if the hacker said they wanted to make a team application */
    inTeam,
    wantsTeam: !inTeam,
    graduationDate: new Date(),
    wantsMailingList: true,
    needsVisa
  }
  return app;
}

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('hackers-applications', [
        generateApplication(1, 'fierce-buggy-snake', true, false),
        generateApplication(2, 'fierce-buggy-snail', true, false),
        generateApplication(3, 'fierce-buggy-turtle', true, false),
        generateApplication(4, 'fierce-buggy-tortoise', true, false)
      ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('hackers-applications', null, {});
  }
};
