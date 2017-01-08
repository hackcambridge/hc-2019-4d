'use strict';

/**
 * Makes it possible for invitations to expire by creating an expiry RSVP
 */

// Sequelize doesn't handle updating of enum values. We have to do this manually
function swapEnumTypes(...enumTypes) {
  return `
    CREATE TYPE "enum_response-rsvps_rsvp-new" AS ENUM(${enumTypes.map(enumType => `'${enumType}'`).join(', ')});

    ALTER TABLE "response-rsvps" 
      ALTER COLUMN rsvp TYPE "enum_response-rsvps_rsvp-new"
        USING (rsvp::text::"enum_response-rsvps_rsvp-new");

    DROP TYPE "enum_response-rsvps_rsvp";

    ALTER TYPE "enum_response-rsvps_rsvp-new" RENAME TO "enum_response-rsvps_rsvp";
  `;
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(swapEnumTypes('RSVP_YES', 'RSVP_NO', 'RSVP_EXPIRED'));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(swapEnumTypes('RSVP_YES', 'RSVP_NO'));
  }
};
