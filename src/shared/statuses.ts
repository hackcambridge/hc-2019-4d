export enum IndividualApplicationStatus {
  INCOMPLETE = 'incomplete',
  COMPLETE = 'complete',
  WITHDRAWN = 'withdrawn',
}

export enum TeamApplicationStatus {
  NOT_APPLICABLE = 'na',
  WANTS_TEAM = 'wanting',
  INCOMPLETE = 'incomplete',
  COMPLETE = 'complete',
}

export enum RsvpStatus {
  NOT_APPLICABLE = 'na',
  INCOMPLETE = 'incomplete',
  COMPLETE_YES = 'complete-yes',
  COMPLETE_NO = 'complete-no',
  COMPLETE_EXPIRED = 'complete-expired',
}

/** This is incompatible with RsvpStatus due to the structure of the database.
 *  See https://github.com/hackcambridge/hack-cambridge-website/issues/589.
 */
export enum CompleteRsvpStatus {
  RSVP_YES = 'RSVP_YES',
  RSVP_NO = 'RSVP_NO',
  RSVP_EXPIRED = 'RSVP_EXPIRED',
}

export enum ResponseStatus {
  PENDING = 'pending',
  INVITED = 'invited',
  REJECTED = 'rejected',
}

export type CompleteResponseStatus = ResponseStatus.INVITED | ResponseStatus.REJECTED;

export enum TicketStatus {
  NO_TICKET = 'no-ticket',
  HAS_TICKET = 'has-ticket',
}

export interface IndividualHackerStatuses {
  individualApplicationStatus: IndividualApplicationStatus;
  teamApplicationStatus: TeamApplicationStatus;
  responseStatus: ResponseStatus;
  rsvpStatus: RsvpStatus;
  ticketStatus: TicketStatus;
}

export enum OverallStatus {
  INCOMPLETE = 'incomplete',
  INCOMPLETE_CLOSED = 'incomplete-closed',
  IN_REVIEW = 'in-review',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  INVITED_AWAITING_RSVP = 'invited-awaiting-rsvp',
  INVITED_ACCEPTED = 'invited-accepted',
  INVITED_DECLINED = 'invited-declined',
  INVITED_EXPIRED = 'invited-expired',
  HAS_TICKET = 'has-ticket',
}

export interface HackerStatuses extends IndividualHackerStatuses {
  overallStatus: OverallStatus;
}

export enum ApplicationsOpenStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

// Copy for the dashboard is written in YAML and as such uses the strings
// here as the keys. If you make a change to a string that appears in
// dashboard.yml, you will have to change it there too.
