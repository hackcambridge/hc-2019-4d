'use strict';

/**
 * Creates the initial database, so other migrations can run on top of it
 */

function createHackerTable(queryInterface, Sequelize) {
  return queryInterface.createTable('hackers', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    mlhId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    gender: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    email: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    // Education
    institution: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    studyLevel: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    course: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    // Logistics
    shirtSize: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    dietaryRestrictions: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    specialNeeds: {
      type: Sequelize.TEXT,
    },
  });
}

function createHackerApplicationTable(queryInterface, Sequelize) {
  return queryInterface.createTable('hackers-applications', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    hackerId: {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: false,
      references: {
        model: 'hackers',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
    applicationSlug: {
      type: Sequelize.TEXT,
      allowNull: false,
      unique: true
    },
    cv: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    developmentRoles: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: false,
    },
    learningGoal: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    interests: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    recentAccomplishment: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    links: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    inTeam: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    wantsTeam: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  });
}

function createApplicationResponseTable(queryInterface, Sequelize) {
  return queryInterface.createTable('application-responses', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    response: {
      type: Sequelize.ENUM('invited', 'rejected'),
      allowNull: false,
    },
    hackerApplicationId: {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: false,
      references: {
        model: 'hackers-applications',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
  });
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    return createHackerTable(queryInterface, Sequelize)
      .then(() => createHackerApplicationTable(queryInterface, Sequelize))
      .then(() => createApplicationResponseTable(queryInterface, Sequelize));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('application-responses')
      .then(() => queryInterface.dropTable('hackers-applications'))
      .then(() => queryInterface.dropTable('hackers'));
  }
};
