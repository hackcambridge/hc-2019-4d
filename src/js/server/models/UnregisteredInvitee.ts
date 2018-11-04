import * as Sequelize from 'sequelize';
import db from './db';
import Hacker, { TeamInstance } from './Team';
import Team, { HackerInstance } from './Hacker';

interface UnregisteredInviteeAttributes {
    id?: number,
    teamId: number;
    email: string;
}

export interface UnregisteredInviteeInstance extends Sequelize.Instance<UnregisteredInviteeAttributes>, UnregisteredInviteeAttributes {
    team?: TeamInstance;
    hacker?: HackerInstance;
}

const attributes: SequelizeAttributes<UnregisteredInviteeAttributes> = {
    teamId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: Team,
        key: 'id',
        deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
    },
    email: {
        type: Sequelize.TEXT,
        allowNull: false,
    }
  };
  
const UnregisteredInvitee = db.define<UnregisteredInviteeInstance, UnregisteredInviteeAttributes>('UnregisteredInvitee', attributes, {
    tableName: 'unregistered-invitees'
})

UnregisteredInvitee.belongsTo(Team);
Team.hasMany(UnregisteredInvitee);
UnregisteredInvitee.belongsTo(Hacker);
Hacker.hasOne(UnregisteredInvitee, { as: 'Team' });

export default UnregisteredInvitee