const Sequelize = require('sequelize');
const { Router } = require('express');
const { db, Hacker, ApplicationReview, HackerApplication, ApplicationResponse, ResponseRsvp, ApplicationTicket } = require('js/server/models');
const { response } = require('js/shared/status-constants');
const { createHttpError } = require('./errors');

const statsRouter = new Router();

statsRouter.get('/', (req, res, next) => {

  // Get:
  // - The total number of applications
  // - The total number of sign ups
  // - The number of reviews (note that each application needs to be reviewed twice)
  // TODO: Get the numbers of reviews made per admin
  // - The number of applications that have been reviewed at least twice

  const hackerCountPromise = Hacker.count();
  const hackerApplicationCountPromise = HackerApplication.count();
  const reviewCountPromise = ApplicationReview.count();
  const invitationsCountPromise = ApplicationResponse.count({ where: { response: response.INVITED } });
  const rejectionsCountPromise = ApplicationResponse.count({ where: { response: response.REJECTED } });
  const rsvpNoCountPromise = ResponseRsvp.count({ where: { rsvp: ResponseRsvp.RSVP_NO }});
  const ticketCountPromise = ApplicationTicket.count();

  const applicationsReviewedQuery = 
    "SELECT COUNT(*) FROM (" + 
      "SELECT \"hackerApplicationId\", COUNT(id)" + 
      "FROM \"application-reviews\"" +
      "GROUP BY \"hackerApplicationId\"" +
    ") review_counts WHERE count >= 2";

  const applicationsReviewedCountPromise = 
  db.query(applicationsReviewedQuery, { type: db.QueryTypes.SELECT }).then((counts) => {
    // Get the number from the object that's returned
    return parseInt(counts[0].count);
  });

  const leaderboardQuery =
    `SELECT "admins"."name", COALESCE(reviews.count, 0) AS count, "admins"."id" FROM
      "admins"
        LEFT JOIN
          (SELECT "adminId", COUNT(DISTINCT "hackerApplicationId") FROM
            "application-reviews"
          GROUP BY "adminId") AS reviews
        ON "admins"."id" = "adminId"
    ORDER BY count DESC, "admins"."name" ASC`;

  const leaderboardPromise = db.query(leaderboardQuery, { type: db.QueryTypes.SELECT });

  Promise.all([
    hackerCountPromise,
    hackerApplicationCountPromise,
    reviewCountPromise,
    applicationsReviewedCountPromise,
    leaderboardPromise,
    invitationsCountPromise,
    rejectionsCountPromise,
    rsvpNoCountPromise,
    ticketCountPromise,
  ])
  .then(
    ([
      hackerCount,
      hackerApplicationCount,
      reviewCount,
      applicationsReviewedCount,
      leaderboard,
      invitationsCount,
      rejectionsCount,
      rsvpNoCount,
      ticketCount,
    ]) => {
      res.json({
        hackerCount,
        hackerApplicationCount,
        reviewCount,
        applicationsReviewedCount,
        leaderboard,
        invitationsCount,
        rejectionsCount,
        rsvpNoCount,
        ticketCount,
      });
    }
  ).catch(next);
});

module.exports = statsRouter;
