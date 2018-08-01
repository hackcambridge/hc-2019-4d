import { HackerApplication, ApplicationTicket } from 'js/server/models';

export function getAllApplicationsWithTickets() {
  return HackerApplication.findAll({
    include: [
      {
        model: ApplicationTicket,
        required: true,
      },
    ],
  });
}
