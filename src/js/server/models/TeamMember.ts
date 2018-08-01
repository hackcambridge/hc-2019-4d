import * as Sequelize from 'sequelize';

import db from './db';
import Hacker, { HackerInstance } from './Hacker';
import Team, { TeamInstance } from './Team';

interface TeamMemberAttributes {
  id?: number;
  teamId: number;
  hackerId: number;
}

export interface TeamMemberInstance extends Sequelize.Instance<TeamMemberAttributes>, TeamMemberAttributes {
  team?: TeamInstance;
  hacker?: HackerInstance;
}

const attributes: SequelizeAttributes<TeamMemberAttributes> = {
  // Foreign keys
  teamId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Team,
      key: 'id',
      deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
    },
  },
  hackerId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Hacker,
      key: 'id',
      deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
    },
  },
};

const TeamMember = db.define<TeamMemberInstance, TeamMemberAttributes>('teamMember', attributes, {
  tableName: 'teams-members'
});

TeamMember.belongsTo(Team);
Team.hasMany(TeamMember);
TeamMember.belongsTo(Hacker);
Hacker.hasOne(TeamMember, { as: 'Team' });

export default TeamMember;
