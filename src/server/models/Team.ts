import { Model } from 'sequelize';

import db from './db';
import { TeamMember } from './TeamMember';

export class Team extends Model {
  public id?: number;
  public teamMembers: TeamMember[];
}

Team.init({}, {
  sequelize: db,
  modelName: 'team',
  tableName: 'teams',
});
