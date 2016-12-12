SELECT "hackers-applications".* FROM "hackers-applications"
INNER JOIN (
  -- Get a list of application IDs and incomplete assignments counts
  SELECT "hackers-applications".id, COUNT(incomplete_assignments.*) FROM "hackers-applications"
  LEFT JOIN (
    -- Get a list of incomplete assignments
    SELECT id, "adminId", "hackerApplicationId"
    FROM "application-assignments"
    -- Filter out those where a review has been submitted by that admin for that application
    WHERE NOT EXISTS (
      SELECT * 
        FROM "application-reviews"
        WHERE "adminId" = "application-assignments"."adminId" AND
        "hackerApplicationId" = "application-assignments"."hackerApplicationId"
    ) AND "application-assignments"."adminId" != :adminId
    -- Filter the list to only those which are less than 30 mins old
    AND "createdAt" > current_timestamp - interval '30 minutes'
  ) incomplete_assignments ON incomplete_assignments."hackerApplicationId"="hackers-applications".id
  GROUP BY "hackers-applications".id
) incomplete_assignments ON
incomplete_assignments.id="hackers-applications".id
INNER JOIN (
  -- Get a list of application IDs and review counts
  SELECT "hackers-applications".id, COUNT("application-reviews".*) FROM "hackers-applications"
  LEFT JOIN "application-reviews" ON
  "application-reviews"."hackerApplicationId"="hackers-applications".id
  GROUP BY "hackers-applications".id
) reviews ON
reviews.id = "hackers-applications".id
-- Filter to those where there are less than 2 reviews started (i.e. those who need more reviews)
WHERE incomplete_assignments.count + reviews.count < 2
-- Filter to those that this admin hasn't yet reviewed
AND NOT EXISTS (
  SELECT * 
  FROM "application-reviews"
  WHERE 
    "adminId" = :adminId AND
    "hackerApplicationId" = "hackers-applications".id
)
ORDER BY
  CASE "hackers-applications"."countryTravellingFrom" = 'GB'
      -- Assign to one of two buckets
      -- If from GB, 30% chance of bucket 0, 70% chance of bucket 1
      -- Otherwise, 70% chance of bucket 0, 30% chance of bucket 1
      -- These numbers are arbitrary and can be happily modified to change skew
      WHEN true THEN floor(random()+0.7)
      ELSE floor(random()+0.3)
    END
    ASC, "createdAt"
LIMIT 1;