import { BelongsToGetAssociationMixin, Model } from 'sequelize';

import db from './db';
import { Hacker } from './Hacker';
import { Team } from './Team';

export class TeamMember extends Model {
  public id?: number;
  public teamId: number;

  public team?: Team;

  public getHacker: BelongsToGetAssociationMixin<Hacker>;
  public hacker?: Hacker;
}

TeamMember.init({}, {
  sequelize: db,
  modelName: 'teamMember',
  tableName: 'teams-members',
});

TeamMember.belongsTo(Team);
Team.hasMany(TeamMember);
TeamMember.belongsTo(Hacker);
Hacker.hasOne(TeamMember);
