export const overall = {
  INCOMPLETE: 'incomplete',
  INCOMPLETE_CLOSED: 'incomplete-closed',
  IN_REVIEW: 'in-review',
  REJECTED: 'rejected',
  INVITED_AWAITING_RSVP: 'invited-awaiting-rsvp',
  INVITED_ACCEPTED: 'invited-accepted',
  INVITED_DECLINED: 'invited-declined',
  INVITED_EXPIRED: 'invited-expired',
  HAS_TICKET: 'has-ticket',
};

export const application = {
  INCOMPLETE: 'incomplete',
  COMPLETE: 'complete',
};

export const teamApplication = {
  NOT_APPLICABLE: 'na',
  WANTS_TEAM: 'wanting',
  INCOMPLETE: 'incomplete',
  COMPLETE: 'complete',
};

export const rsvp = {
  NOT_APPLICABLE: 'na',
  INCOMPLETE: 'incomplete',
  COMPLETE_YES: 'complete-yes',
  COMPLETE_NO: 'complete-no',
  COMPLETE_EXPIRED: 'complete-expired',
};

export const furtherDetails = {
  INCOMPLETE: 'incomplete',
  COMPLETE: 'complete',
};

export const response = {
  PENDING: 'pending',
  INVITED: 'invited',
  REJECTED: 'rejected',
};

export const ticket = {
  NO_TICKET: 'no-ticket',
  HAS_TICKET: 'has-ticket',
};

export const applicationsOpen = {
  OPEN: 'open',
  CLOSED: 'closed',
};

// Copy for the dashboard is written in YAML and as such uses the strings
// here as the keys. If you make a change to a string that appears in 
// dashboard.yml, you will have to change it there too.
