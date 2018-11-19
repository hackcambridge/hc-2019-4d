import { UserRequest } from 'js/server/routes/apply-router';
import { rsvpToResponse } from 'js/server/attendance/logic';

export function createRsvp(req: UserRequest, res) {
  if (req.body.rsvp) {
    req.user.getHackerApplication().then(hackerApplication => {
      if (hackerApplication == null) {
        return Promise.resolve(null);
      } else {
        return hackerApplication.getApplicationResponse();
      }
    }).then(applicationResponse => {
      if (applicationResponse == null) {
        // No response found
        return Promise.resolve(null);
      } else {
        // Found a response
        return applicationResponse.getResponseRsvp().then(responseRsvp => {
          if (responseRsvp != null) {
            console.log('There was already an RSVP for this application, ignoring new');
            return Promise.resolve(null);
          } else {
            return rsvpToResponse(applicationResponse, req.body.rsvp);
          }
        });
      }
    }).then(_ => res.redirect('/apply/dashboard'));
  } else {
    // No RSVP given so just redirect
    res.redirect('/apply/dashboard');
  }
}
