import { NextFunction, Request, Response } from 'express';

import { UserRequest } from 'server/routes/apply-router';
import { ApplicationsOpenStatus } from 'shared/statuses';

/**
 * Intercepts the request to check if the user has submitted an application
 *
 * If they have, it will redirect them to the previous page. Otherwise, it will let them proceed
 * as normal.
 */

export function goBackIfApplied(req: UserRequest, res: Response, next: NextFunction) {
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

export function setAppliedStatus(req: UserRequest, res: Response, next: NextFunction) {
  alreadyApplied(req, res, next).then((applied: boolean) => {
    res.locals.applied = applied;
    next();
  }).catch(next);
}

export function setApplicationsStatus(req: Request, res: Response, next: NextFunction) {
  applicationsClosed(req, res, next).then((closed: boolean) => {
    res.locals.applicationsOpen = !closed;
    next();
  }).catch(next);
}

export async function applicationsClosed(_req: Request, _res: Response, _next: NextFunction) {
  return process.env.APPLICATIONS_OPEN_STATUS === ApplicationsOpenStatus.CLOSED;
}

export async function alreadyApplied(req: UserRequest, _res: Response, _next: NextFunction) {
  if (req.user) {
    const hackerApplication = await req.user.getHackerApplication();

    if (hackerApplication) {
      return true;
    }
  }
  return false;
}
