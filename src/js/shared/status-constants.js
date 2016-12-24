module.exports = {
  overall: {
    INCOMPLETE: 'incomplete',
    IN_REVIEW: 'in-review',
    REJECTED: 'rejected',
    INVITED_AWAITING_RSVP: 'invited-awaiting-rsvp',
    INVITED_COMPLETE: 'invited-complete',
    INVITED_DECLINED: 'invited-declined',
  },
  application: {
    INCOMPLETE: 'incomplete',
    COMPLETE: 'complete',
  },
  teamApplication: {
    NOT_APPLICABLE: 'na',
    WANTS_TEAM: 'wanting',
    INCOMPLETE: 'incomplete',
    COMPLETE: 'complete',
  },
  rsvp: {
    NOT_APPLICABLE: 'na',
    INCOMPLETE: 'incomplete',
    COMPLETE_YES: 'complete-yes',
    COMPLETE_NO: 'complete-no',
  },
  furtherDetails: {
    INCOMPLETE: 'incomplete',
    COMPLETE: 'complete',
  },
  response: {
    PENDING: 'pending',
    INVITED: 'invited',
    REJECTED: 'rejected',
  }

}

// Copy for the dashboard is written in YAML and as such uses the strings
// here as the keys. If you make a change to a string that appears in 
// dashboard.yml, you will have to change it there too.