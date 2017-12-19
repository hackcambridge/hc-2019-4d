import express = require('express');
const { OauthAccessToken } = require('js/server/models');

const tokensRouter = express.Router();

/**
 * Gets information for a particular access token
 */
tokensRouter.get('/:token', (req, res, next) => {
  OauthAccessToken.findOne({
    where: {
      token: req.params.token,
    },
  }).then(token => {
    if (!token) {
      next();
      return;
    }

    res.json({
      token
    });
  }).catch(next);
});

module.exports = tokensRouter;
