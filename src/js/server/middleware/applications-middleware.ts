import { Request, Response, NextFunction } from 'express';

import { HackerApplicationInstance } from 'js/server/models';
import * as statuses from 'js/shared/status-constants';

/**
 * Intercepts the request to check if the user has submitted an application
 * 
 * If they have, it will redirect them to the previous page. Otherwise, it will let them proceed
 * as normal.
 */
 
export function goBackIfApplied(req: Request, res: Response, next: NextFunction) {
  alreadyApplied(req, res, next).then((applied: boolean) => {
    applied === true ? res.redirect('back') : next();
  }).catch(next);
}

/**
 * Intercepts requests to check if applications are still open, redirecting to the previous page
 * if not
 */

export function goBackIfApplicationsClosed(req: Request, res: Response, next: NextFunction) {
  applicationsClosed(req, res, next).then((closed: boolean) => {
    closed === true ? res.redirect('back') : next();
  }).catch(next); 
}

    res.locals.applied = applied === true ? true : false;
export function setAppliedStatus(req: Request, res: Response, next: NextFunction) {
  alreadyApplied(req, res, next).then((applied: boolean) => {
    next();
  }).catch(next); 
}

    res.locals.applicationsOpen = closed === false ? true : false;
export function setApplicationsStatus(req: Request, res: Response, next: NextFunction) {
  applicationsClosed(req, res, next).then((closed: boolean) => {
    next();
  }).catch(next); 
}

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
export async function applicationsClosed(req: Request, res: Response, next: NextFunction) {
}

export async function alreadyApplied(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
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
  } else {
    return false;
  }
}
