-- Get individual scores
SELECT id AS application_id, AVG(sum), stddev_samp(sum) FROM (
  -- Get application review total scores (multiple reviews for each application)
  SELECT "hackers-applications".id, "application-reviews".id AS review, "application-reviews"."adminId", SUM("review-criteria-scores".score) FROM "hackers-applications"
  -- Find how many reviews each application has
  LEFT JOIN (
    -- Get a list of application IDs and review counts
    SELECT "hackers-applications".id, COUNT("application-reviews".id) FROM "hackers-applications"
    LEFT JOIN "application-reviews" ON
    "application-reviews"."hackerApplicationId"="hackers-applications".id
    GROUP BY "hackers-applications".id
  ) review_counts ON
  review_counts.id = "hackers-applications".id

  INNER JOIN "application-reviews" ON
  "application-reviews"."hackerApplicationId" = "hackers-applications".id
  INNER JOIN "review-criteria-scores" ON
  "review-criteria-scores"."applicationReviewId" = "application-reviews".id
  WHERE review_counts.count >= 2
  GROUP BY "application-reviews".id, "hackers-applications".id
) sums GROUP BY id