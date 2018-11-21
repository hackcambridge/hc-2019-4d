/**
 * @module Module for hitting the Slack API.
 *
 * We don't use any existing packages because we are hitting undocumented API endpoints.
 * Information on those here: https://github.com/ErikKalkoken/slackApiDoc
 */

import fetch from 'node-fetch';
import * as querystring from 'querystring';

const SLACK_API_TOKEN = process.env.SLACK_API_TOKEN;
const SLACK_API_BASE = 'https://slack.com/api/';

export class SlackApiError extends Error { }

/**
 * Makes a call to the Slack API.
 *
 * All Slack API endpoints return a 200 even in the event of error. It's up to the caller
 * to interpret the "ok" and "error" values of the returned object.
 */
function makeSlackApiCall(endpoint: string, params = { }) {
  const query = querystring.stringify(
    Object.assign({ token: SLACK_API_TOKEN }, params)
  );

  const apiUrl = `${SLACK_API_BASE}${endpoint}?${query}`;

  console.log(`Hitting Slack endpoint ${apiUrl}`);

  return fetch(apiUrl)
    .then(response => response.json());
}

/**
 * Invites a user to the Slack channel associated with the token
 *
 * @returns a promise that resolves to whether an invite was sent or not
 */
export function inviteUser(email: string, firstName: string, lastName: string): Promise<boolean> {
  console.log(`Inviting ${email} to Slack`);
  return makeSlackApiCall('users.admin.invite', {
    email,
    first_name: firstName,
    last_name: lastName,
    resend: true,
  }).then(response => {
    if (!response.ok) {
      console.log(`Slack invite for ${email} failed due to ${response.error}`);
    }

    return response.ok;
  });
}

/**
 * Gets all Slack users
 */
export function getUsers(): Promise<any[]> {
  return makeSlackApiCall('users.list', { })
    .then(response => {
      if (!response.ok) {
        throw new SlackApiError(response.error);
      }

      return response.members;
    });
}
