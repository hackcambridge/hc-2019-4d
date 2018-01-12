const { HackerApplication, ApplicationTicket } = require('js/server/models');

function getAllApplicationsWithTickets() {
  return HackerApplication.findAll({
    include: [
      {
        model: ApplicationTicket,
        required: true,
      },
    ],
  });
}

module.exports = {
  getAllApplicationsWithTickets
};
