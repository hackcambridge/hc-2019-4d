const { Router } = require('express');
const { ReviewCriterion } = require('js/server/models');

const criteriaRouter = new Router();

/**
 * Gets all review criteria
 */
criteriaRouter.get('/', (req, res, next) => {
  ReviewCriterion.findAll().then((criteria) => {
    res.json({ criteria });
  }).catch(next);
});

module.exports = criteriaRouter;
