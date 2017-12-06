const { Router } = require('express');
const { Admin, HackerApplication, ApplicationReview } = require('js/server/models');
import reviewLogic = require('js/server/review/logic');

/**
 * The amount to increase admin goals by to allow for the fact that
 * not everyone will meet their goal.
 */
const GOAL_BOOST = 1.2;

const adminsRouter = new Router();

adminsRouter.get('/by-email/:email', (req, res, next) => {
  Admin
    .findOne({
      where: {
        email: req.params.email,
      },
    })
    .then(admin => {
      if (!admin) {
        next();
        return;
      }

      res.json({ admin });
    })
    .catch(next);
});

adminsRouter.get('/:adminId/next-review-application', (req, res, next) => {
  Admin
    .findById(req.params.adminId)
    .then(admin => {
      if (!admin) {
        next();
        return;
      }

      return reviewLogic
        .getNextApplicationToReviewForAdmin(admin)
        .then(application => {
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
      .then(applicationReview => {
        res.json({
          applicationReview,
        });
      });
  }).catch(next);
});

adminsRouter.get('/:adminId/reviews/:applicationId', (req, res, next) => {
  reviewLogic.getApplicationReview(req.params.adminId, req.params.applicationId)
    .then(applicationReview => {
      if (!applicationReview) {
        next();
        return;
      }

      res.json({
        applicationReview
      });
    })
    .catch(next);
});

function getNumberOfCommittedAdmins() {
  return Admin.count({
    where: { lowCommittal: false }
  });
}

adminsRouter.get('/:adminId/stats', (req, res, next) => {
  Admin
    .findById(req.params.adminId)
    .then(admin => {
      if (!admin) {
        next();
        return;
      }

      return Promise.all([
        ApplicationReview.count({ where: { adminId: admin.id }}),
        HackerApplication.count(),
        getNumberOfCommittedAdmins(),
      ]).then(([ applicationsReviewedByAdminCount, applicationCount, committedAdminCount ]) => {
        const reviewGoal = committedAdminCount == 0 ? 0 :
          Math.ceil(applicationCount * 2 / committedAdminCount * GOAL_BOOST);

        res.json({
          applicationsReviewedCount: applicationsReviewedByAdminCount,
          applicationsReviewedGoal: reviewGoal,
        });
      });
    })
    .catch(next);
});

module.exports = adminsRouter;
