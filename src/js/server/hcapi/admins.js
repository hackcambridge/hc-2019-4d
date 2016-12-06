const { Router } = require('express');
const { Admin, HackerApplication } = require('js/server/models');
const { createHttpError } = require('./errors');
const reviewLogic = require('js/server/review/logic');

const adminsRouter = new Router();

adminsRouter.get('/:adminId/next-review-application', (req, res, next) => {
  Admin
    .findById(req.params.adminId)
    .then((admin) => {
      if (!admin) {
        next();
        return;
      }

      return reviewLogic
        .getNextApplicationToReviewForAdmin(admin)
        .then((application) => {
          if (!application) {
            res.json({ applicationId: null });
          } else {
            res.json({ applicationId: application.id });
          }
        });
    })
    .catch(next);
});

/**
 * Creates a review for a particluar application, by a particular admin.
 * Request body should contain a key `scores` which is an array of scored criteria:
 *
 * ```
 * {
 *   scores: [
 *     { reviewCriterionId: 1, score: 0 },
 *     { reviewCriterionId: 2, score: 1 },
 *   ],
 * }
 * ```
 */
adminsRouter.post('/:adminId/reviews/:applicationId', (req, res, next) => {
  Promise.all([
    Admin.findById(req.params.adminId),
    HackerApplication.findById(req.params.applicationId),
  ]).then(([admin, hackerApplication]) => {
    if ((!admin) || (!hackerApplication)) {
      next();
      return;
    }

    const reviewCriterionScores = req.body.scores.map(({ reviewCriterionId, score }) => ({
      reviewCriterionId,
      score,
    }));

    return reviewLogic.reviewApplication(admin, hackerApplication, reviewCriterionScores)
      .then((applicationReview) => {
        res.json({
          applicationReview,
        });
      });
  }).catch(next);
})

module.exports = adminsRouter;
