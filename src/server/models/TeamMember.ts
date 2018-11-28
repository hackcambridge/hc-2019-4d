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
  getTeam: () => Promise<TeamInstance>;
  team?: TeamInstance;

  getHacker: () => Promise<HackerInstance>;
  hacker?: HackerInstance;
}

const attributes: SequelizeAttributes<TeamMemberAttributes> = {
  // Foreign keys
  teamId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Team,
      allowNull: true,
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
