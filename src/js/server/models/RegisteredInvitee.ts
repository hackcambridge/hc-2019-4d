import * as Sequelize from 'sequelize';
import db from './db';
import Hacker, { TeamInstance } from './Team';
import Team, { HackerInstance } from './Hacker';

interface RegisteredInviteeAttributes {
    id?: number,
    teamId: number;
    hackerId: number;
}

export interface RegisteredInviteeInstance extends Sequelize.Instance<RegisteredInviteeAttributes>, RegisteredInviteeAttributes {
    team?: TeamInstance;
    hacker?: HackerInstance;
}

const attributes: SequelizeAttributes<RegisteredInviteeAttributes> = {
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
  
const RegisteredInvitee = db.define<RegisteredInviteeInstance, RegisteredInviteeAttributes>('registeredInvitee', attributes, {
    tableName: 'registered-invitees'
})

RegisteredInvitee.belongsTo(Team);
Team.hasMany(RegisteredInvitee);
RegisteredInvitee.belongsTo(Hacker);
Hacker.hasOne(RegisteredInvitee, { as: 'Team' });

export default RegisteredInvitee