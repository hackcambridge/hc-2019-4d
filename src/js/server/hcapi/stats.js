const { Router } = require('express');
const { Hacker, ApplicationReview, HackerApplication } = require('js/server/models');
const { createHttpError } = require('./errors');

const statsRouter = new Router();

statsRouter.get('/', (req, res, next) => {

  // Get:
  // - The total number of applications
  // - The total number of sign ups
  // - The number of reviews (note that each application needs to be reviewed twice)
  // TODO: Get the numbers of reviews made per admin

  const hackerCountPromise = Hacker.count();
  const hackerApplicationCountPromise = HackerApplication.count();
  const reviewCountPromise = ApplicationReview.count();

  Promise.all([hackerCountPromise, hackerApplicationCountPromise, reviewCountPromise]).then((counts) => {
    res.json({
      hackerCount: counts[0],
      hackerApplicationCount: counts[1],
      reviewCount: counts[2],
    });
  }).catch(next);

});

module.exports = statsRouter;
