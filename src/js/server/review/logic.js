const Sequelize = require('sequelize');
const { ReviewCriterionScore, ApplicationReview, HackerApplication, db } = require('js/server/models');

function upsertCriterionScore(applicationReviewId, reviewCriterionId, score, transaction) {
  // Sequelize's upsert does not work with composite unique keys
  // So we have to make our own
  const upsertWith = {
    applicationReviewId,
    reviewCriterionId,
    score,
  };

  return ReviewCriterionScore.findOne({
    where: {
      applicationReviewId,
      reviewCriterionId,
    },
    transaction,
  }).then((reviewCriterionScore) => {
    if (!reviewCriterionScore) {
      return ReviewCriterionScore.create(upsertWith, { transaction });
    }

    return reviewCriterionScore.update(upsertWith, { transaction });
  });
}

/**
 * Idempotently review an application by an admin.
 */
exports.reviewApplication = function reviewApplication(admin, hackerApplication, reviewCriterionScores) {
  const reviewKey = {
    adminId: admin.id,
    hackerApplicationId: hackerApplication.id,
  };

  return db.transaction((transaction) => 
    ApplicationReview
      .upsert(reviewKey, { transaction })
      .then(() => ApplicationReview.findOne({ where: reviewKey, transaction }))
      .then((applicationReview) => Promise.all(
        reviewCriterionScores.map(({ reviewCriterionId, score }) => upsertCriterionScore(applicationReview.id, reviewCriterionId, score, transaction))
      ))
      .then(() => ApplicationReview.findOne({ 
        where: reviewKey,
        include: [ ReviewCriterionScore ],
        transaction,
      }))
  );
};

/**
 * Get a review by an admin for an application.
 */
exports.getApplicationReview = function getApplicationReview(adminId, hackerApplicationId) {
  return ApplicationReview.findOne({
    where: {
      adminId,
      hackerApplicationId,
    },
    include: [ ReviewCriterionScore ],
  });
}

exports.getNextApplicationToReviewForAdmin = function getNextApplicationToReviewForAdmin(admin) {
  // TODO: Make this return something meaningful
  return HackerApplication.findOne({
    order: [ Sequelize.fn('RANDOM') ],
  });
};
