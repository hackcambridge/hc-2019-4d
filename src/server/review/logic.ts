import * as fs from 'fs';
import * as Sequelize from 'sequelize';

import { ApplicationAssignment, ApplicationReview, db, HackerApplication, ReviewCriterionScore } from 'server/models';

const assignmentQuery = fs.readFileSync('src/server/review/assign.sql', 'utf8');

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
  }).then(reviewCriterionScore => {
    if (!reviewCriterionScore) {
      return ReviewCriterionScore.create(upsertWith, { transaction });
    }

    return reviewCriterionScore.update(upsertWith, { transaction });
  });
}

/**
 * Idempotently review an application by an admin.
 */
export function reviewApplication(admin, hackerApplication, reviewCriterionScores) {
  const reviewKey = {
    adminId: admin.id,
    hackerApplicationId: hackerApplication.id,
  };

  return db.transaction(transaction =>
    ApplicationReview
      .upsert(reviewKey, { transaction })
      .then(() => ApplicationReview.findOne({ where: reviewKey, transaction }))
      .then(applicationReview => Promise.all(
        reviewCriterionScores.map(({ reviewCriterionId, score }) =>
          upsertCriterionScore(applicationReview.id, reviewCriterionId, score, transaction))
      ))
      .then(() => ApplicationReview.findOne({
        where: reviewKey,
        include: [ ReviewCriterionScore ],
        transaction,
      }))
  );
}

/**
 * Get a review by an admin for an application.
 */
export function getApplicationReview(adminId, hackerApplicationId) {
  return ApplicationReview.findOne({
    where: {
      adminId,
      hackerApplicationId,
    },
    include: [ ReviewCriterionScore ],
  });
}

export function getNextApplicationToReviewForAdmin(admin) {
  // We use a transaction to make sure we don't assign an application without storing an assignment record
  return db.transaction(t => {
    // Get an application
    return db.query(assignmentQuery, {
      // There is a placeholder in the SQL file marked ':adminId',
      // we replace it here with current admin Id
      replacements: {adminId: admin.id},
      type: Sequelize.QueryTypes.SELECT,
      transaction: t,
    }).then(applicationRecords => {
      // db.query returns an array, check if it contains a result
      if (applicationRecords === undefined || applicationRecords.length === 0) {
        console.log('Couldn\'t find any applications to assign to this admin');
        return null;
      } else {
        // Build a HackerApplication object from the result
        const applicationRecord = applicationRecords[0];
        const hackerApplication = HackerApplication.build(applicationRecord, {raw: true, isNewRecord: false});

        // Make new assignment record
        return ApplicationAssignment.create({
          adminId: admin.id,
          hackerApplicationId: hackerApplication.id
        }, { transaction: t }).then(() => {
          return hackerApplication;
        });
      }
    });
  }).catch(err => {
    console.log('Failed to assign application to admin. Rolled back.');
    console.log(err);
  });
}
