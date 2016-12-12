const Sequelize = require('sequelize');
const { ReviewCriterionScore, ApplicationReview, HackerApplication, ApplicationAssignment } = require('js/server/models');

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
  // TODO: Make this return something meaningful
  return HackerApplication.findOne({
    order: [ Sequelize.fn('RANDOM') ],
  }).then((hackerApplication) => {
    // Add this assignment to the assignments table
    // Resolve to the application only when the assignment
    // has been recorded
    return ApplicationAssignment.create({
      adminId: admin.id,
      hackerApplicationId: hackerApplication.id
    }).then(() => { return hackerApplication });
  });
};
