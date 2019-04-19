import { Router } from 'express';
import * as Sequelize from 'sequelize';

import { ApplicationResponse, ApplicationReview, ApplicationTicket, db, Hacker, HackerApplication, ResponseRsvp } from 'server/models';
import { CompleteRsvpStatus, ResponseStatus } from 'shared/statuses';

const statsRouter = Router();

statsRouter.get('/', async (_req, res, next) => {

  // Get:
  // - The total number of applications
  // - The total number of sign ups
  // - The number of reviews (note that each application needs to be reviewed twice)
  // TODO: Get the numbers of reviews made per admin
  // - The number of applications that have been reviewed at least twice

  const hackerCountPromise = Hacker.count();
  const hackerApplicationCountPromise = HackerApplication.count();
  const hackerApplicationWithdrawnCountPromise = HackerApplication.count({ where: { isWithdrawn: true } });
  const reviewCountPromise = ApplicationReview.count();
  const invitationsCountPromise = ApplicationResponse.count({ where: { response: ResponseStatus.INVITED } });
  const rejectionsCountPromise = ApplicationResponse.count({ where: { response: ResponseStatus.REJECTED } });
  const rsvpNoCountPromise = ResponseRsvp.count({ where: { rsvp: CompleteRsvpStatus.RSVP_NO }});
  const expiredCountPromise = ResponseRsvp.count(({ where: { rsvp: CompleteRsvpStatus.RSVP_EXPIRED }}));
  const ticketCountPromise = ApplicationTicket.count();

  const applicationsReviewedQuery =
    `SELECT COUNT(*) FROM (
      SELECT "hackerApplicationId", COUNT("application-reviews".id)
      FROM "application-reviews"
      INNER JOIN "hackers-applications" ON "hackers-applications".id = "hackerApplicationId"
      WHERE "hackers-applications"."isWithdrawn" = FALSE
      GROUP BY "hackerApplicationId"
    ) review_counts WHERE count >= 2`;

  /** Applications reviewed and not withdrawn */
  const applicationsReviewedCountPromise =
  db.query(applicationsReviewedQuery, { type: Sequelize.QueryTypes.SELECT }).then(counts => {
    // Get the number from the object that's returned
    return parseInt(counts[0].count, 10);
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

  const leaderboardPromise = db.query(leaderboardQuery, { type: Sequelize.QueryTypes.SELECT });

  try {
    const [
      hackerCount,
      hackerApplicationCount,
      hackerApplicationWithdrawnCount,
      reviewCount,
      applicationsReviewedCount,
      leaderboard,
      invitationsCount,
      rejectionsCount,
      rsvpNoCount,
      ticketCount,
      expiredCount,
    ] = await Promise.all([
      hackerCountPromise,
      hackerApplicationCountPromise,
      hackerApplicationWithdrawnCountPromise,
      reviewCountPromise,
      applicationsReviewedCountPromise,
      leaderboardPromise,
      invitationsCountPromise,
      rejectionsCountPromise,
      rsvpNoCountPromise,
      ticketCountPromise,
      expiredCountPromise,
    ]);

    return res.json({
      hackerCount,
      hackerApplicationCount,
      hackerApplicationWithdrawnCount,
      reviewCount,
      applicationsReviewedCount,
      leaderboard,
      invitationsCount,
      rejectionsCount,
      rsvpNoCount,
      ticketCount,
      expiredCount,
    });
  } catch (e) {
    next(e);
  }
});

export default statsRouter;
