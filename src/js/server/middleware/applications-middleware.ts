import { HackerApplicationInstance } from 'js/server/models';
import * as statuses from 'js/shared/status-constants';

/**
 * Intercepts the request to check if the user has submitted an application
 * 
 * If they have, it will redirect them to the dashboard. Otherwise, it will let them proceed
 * as normal.
 */
export function goHomeIfAlreadyApplied(req, res, next) {
  req.user.getHackerApplication().then((hackerApplication: HackerApplicationInstance) => {
    if (hackerApplication) {
      res.redirect(`${req.baseUrl}/dashboard`);
      return;
    }
    next();
  }).catch(next);
}

/**
 * Intercepts requests to check if applications are still open, redirecting to the dashboard if not
 */

export function checkApplicationsOpen(req, res, next) {
  if (process.env.APPLICATIONS_OPEN_STATUS === statuses.applicationsOpen.CLOSED) {
    res.redirect(`${req.baseUrl}/dashboard`);
    return;
  }
  
  next();
}
