import * as Sequelize from 'sequelize';

import db from './db';
import { TeamMemberInstance } from './TeamMember';

export interface TeamInstance extends Sequelize.Instance<{}> {
  id?: number;
  teamMembers: TeamMemberInstance[];

  /**
   * Returns the total number of members, including invitees.
   */
  getTotalMembersCount?: () => number;
}

/**
 * Returns the total number of members, including invitees.
 */
function getTotalMembersCount(this: TeamInstance) {
  return this.teamMembers.length;
}

const Team = db.define<TeamInstance, {}>('team', { }, {
  tableName: 'teams',
  instanceMethods: [getTotalMembersCount]
});

export default Team;
