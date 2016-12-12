const Sequelize = require('sequelize');
const { ReviewCriterionScore, ApplicationReview, HackerApplication, ApplicationAssignment, db } = require('js/server/models');
const fs = require('fs');

exports.reviewApplication = function reviewApplication(admin, hackerApplication, reviewCriterionScores) {
  // TODO: Make this operation idempotent to allow for multiple calls to edit reviews
  // Current behaviour is to throw an error as the unique constraint will be violated.
  // Naive .upsert will not work as we are simultaneously adding associations.
  return ApplicationReview.create({
    adminId: admin.id,
    hackerApplicationId: hackerApplication.id,
    reviewCriterionScores,
  }, {
    include: [ ReviewCriterionScore ],
  });
};

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
