const { Router } = require('express');
const { OauthAccessToken } = require('js/server/models');
const { createHttpError } = require('./errors');

const tokensRouter = new Router();

/**
 * Gets information for a particular access token
 */
tokensRouter.get('/:token', (req, res, next) => {
  OauthAccessToken.findOne({
    where: {
      token: req.params.token,
    },
  }).then((token) => {
    if (!token) {
      throw createHttpError(404, 'Not Found');
    }

    res.json({
      token
    });
  }).catch(next);
});

module.exports = tokensRouter;
