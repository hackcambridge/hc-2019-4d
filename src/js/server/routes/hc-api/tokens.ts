import { Router } from 'express';
import { OauthAccessToken } from 'js/server/models';

const tokensRouter = Router();

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

export default tokensRouter;
