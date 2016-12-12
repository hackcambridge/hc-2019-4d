const Sequelize = require('sequelize');
const { ReviewCriterionScore, ApplicationReview, HackerApplication, ApplicationAssignment, db } = require('js/server/models');
const fs = require('fs');

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
  // To get an appropriate application we run the query stored at assign.sql
  const assignmentQuery = fs.readFileSync('src/js/server/review/assign.sql', 'utf8');
  return db.query(assignmentQuery, {
    // There is a placeholder in the SQL file marked ':adminId', we replace it here
    replacements: {adminId: admin.id},
    type: Sequelize.QueryTypes.SELECT
  }).then((applicationRecords) => {
    // db.query returns an array, check if it contains a result
    if (applicationRecords === undefined || applicationRecords.length == 0) {
      console.log("Couldn't find any applications to assign to this admin");
      return null;
    } else {
      // Build a HackerApplication object from the result
      const applicationRecord = applicationRecords[0];
      const hackerApplication = HackerApplication.build(applicationRecord, {raw: true, isNewRecord: false});
      
      // Add this assignment to the assignments table
      // Resolve to the application only when the assignment
      // has been recorded
      return ApplicationAssignment.create({
        adminId: admin.id,
        hackerApplicationId: hackerApplication.id
      }).then(() => { return hackerApplication });
    }
  });
};
