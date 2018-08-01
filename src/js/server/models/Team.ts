import * as Sequelize from 'sequelize';

import db from './db';
import { TeamMemberInstance } from './TeamMember';

export interface TeamInstance extends Sequelize.Instance<{}> {
  id?: number;
  teamMembers: TeamMemberInstance[];
}

export default db.define<TeamInstance, {}>('team', { }, {
  tableName: 'teams'
});
