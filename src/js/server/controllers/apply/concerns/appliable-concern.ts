import { HackerApplicationInstance } from 'js/server/models';
import * as statuses from 'js/shared/status-constants';

/**
 * Intercepts the request to check if the user has submitted an application
 * 
 * If they have, it will redirect them to the dashboard. Otherwise, it will let them proceed
 * as normal.
 */
 
export function goBackIfApplied(req, res, next) {
  alreadyApplied(req, res, next).then(applied => {
    if (applied === true) {
      res.redirect('back');
    } else {
      next();
    }
  }).catch(next);
}

/**
 * Intercepts requests to check if applications are still open, redirecting to the dashboard if not
 */

export function goBackIfApplicationsClosed(req, res, next) {
  if (applicationsClosed(req, res, next)) {
    res.redirect('back');
  } else {
    next();
  }
}

export function setAppliedStatus(req, res, next) {
  alreadyApplied(req, res, next).then(applied => {
    if (applied === true) {
      res.locals.applied = true;
    } else {
      res.locals.applied = false;
    }
    next();
  }).catch(next); 
}

export function setApplicationsStatus(req, res, next) {
  alreadyApplied(req, res, next).then(applied => {
    if (applied === true) {
      res.locals.applicationsOpen = true;
    } else {
      res.locals.applicationsOpen = false;
    }
    next();
  }).catch(next); 
}

export function applicationsClosed(req, res, next) {
  try {
    if (process.env.APPLICATIONS_OPEN_STATUS === statuses.applicationsOpen.CLOSED) {
      throw 'Applications closed!';
    } else {
      return false;
    }
  } catch(error) {
    if (error === 'Applications closed!') {
      return true;
    }
  }
}

export async function alreadyApplied(req, res, next) {
  return await req.user.getHackerApplication().then((hackerApplication: HackerApplicationInstance) => {
    try {
      if (hackerApplication) {
        throw 'Application already made!';
      } else {
        return false;
      }
    } catch(error) {
      if (error === 'Application already made!') {
        return true;
      }
    }
  }).catch(next);
}
