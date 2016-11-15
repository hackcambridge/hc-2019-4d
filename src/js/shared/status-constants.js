module.exports = {
  overall: {
    INCOMPLETE: 'incomplete',
    IN_REVIEW: 'in-review',
    REJECTED: 'rejected',
    ACCEPTED_INCOMPLETE: 'accepted-incomplete',
    ACCEPTED_COMPLETE: 'accepted-complete'
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