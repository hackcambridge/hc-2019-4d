import { Router } from 'express';
import { ReviewCriterion } from 'js/server/models';

const criteriaRouter = Router();

/**
 * Gets all review criteria
 */
criteriaRouter.get('/', (_req, res, next) => {
  ReviewCriterion.findAll().then(criteria => {
    res.json({ criteria });
  }).catch(next);
});

export default criteriaRouter;
