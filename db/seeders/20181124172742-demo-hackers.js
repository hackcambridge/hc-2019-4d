'use strict';

function generatePerson(id, firstName, lastName) {
  let newPerson = {
    id,
    mlhId: id,
    createdAt: new Date(),
    updatedAt: new Date(),
    firstName,
    lastName,
    gender: 'male',
    dateOfBirth: new Date('1995-12-17'),
    email: `${firstName}.${lastName}@fakeemail.com`,
    phoneNumber: '07555111222',
    institution: 'Cambridge',
    studyLevel: 'University (Undergraduate)',
    course: 'Computer Science',
    shirtSize: 'Unisex - M',
    dietaryRestrictions: 'Vegetarian',
    specialNeeds: null
  }

  return newPerson;
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('hackers', [
      generatePerson(1, 'Joe', 'Smith'),
      generatePerson(2, 'Joe', 'Blogs')
      ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('hackers', null, {});
  }
};
