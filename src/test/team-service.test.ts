
import { expect } from 'chai';
// import { exec } from 'child_process';
import { assert, spy } from 'sinon';
import { Hacker, HackerInstance, TeamMember } from '../server/models';
import { TeamService, TeamServiceConfig } from '../server/routes/apply/team-service';

class MockConfig implements TeamServiceConfig {
  public sendUserLeftTeamEmail(recipient: HackerInstance, leaving: HackerInstance): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(`sendUserLeftTeamEmail(${recipient.email}, ${leaving.email})`));
      }, 300);
    });
  }

  public sendUserInvitationToApplyEmail(recipient: string, from: HackerInstance): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(`sendUserInvitationToApplyEmail(${recipient}, ${from})`));
      }, 300);
    });
  }

  public sendUserInvitationToJoinEmail(recipient: HackerInstance, from: HackerInstance): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(`sendUserInvitationToJoinEmail(${recipient}, ${from})`));
      }, 300);
    });
  }

  public sendUserRemovedEmail(removed: HackerInstance, recipient: HackerInstance, remover: HackerInstance): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(`sendUserRemovedEmail(${removed.email}, ${recipient.email}, ${remover.email})`));
      }, 300);
    });
  }
}

describe('Test seeding creates hackers', () => {
  it('should have the specified hackers as created in the seeder file', async () => {
    const teamMember = await Hacker.findOne({
      where: {
        email: 'Joe.Smith@fakeemail.com'
      }
    });

    const otherTeamMember = await Hacker.findOne({
      where: {
        email: 'Joe.Blogs@fakeemail.com'
      }
    });

    expect(otherTeamMember).to.not.be.equal(null);
    expect(teamMember).to.not.be.equal(null);
    expect(otherTeamMember).to.not.be.equal(null);
    expect(teamMember.Team).to.equal(otherTeamMember.Team);
  });
});

describe('Team Service', () => {
  beforeEach( () => {
    // exec('yarn seed:all');
  });
  describe('#leaveOwnTeam()', () => {
    it('should remove member from team, deleting team if last and sending email to all others', async () => {
      const mockTeamService = new TeamService(new MockConfig());
      const otherTeamMember = await Hacker.findOne({
        where: {
          email: 'Joe.Smith@fakeemail.com'
        }
      });

      const hackerToRemove = await Hacker.findOne({
        where: {
          email: 'Joe.Blogs@fakeemail.com'
        }
      });

      expect(otherTeamMember).to.not.be.equal(null);
      expect(hackerToRemove).to.not.be.equal(null);
      await mockTeamService.leaveOwnTeam(hackerToRemove);
      const teamMember = await otherTeamMember.getTeam();
      const team = await teamMember.getTeam();
      // Currently the getTotalMemberCount and the team.teamMembers attribute don't work
      const teamMembers = await TeamMember.findAll({
        where: {
          teamId: team.id
        }
      });
      const emails = teamMembers.map(async member => {
        const hacker = await member.getHacker();
        return hacker.email;
      });

      expect(emails).to.not.include.members(['Joe.Blogs@fakeemail.com']);
    });
  });
  describe('#addNewMemberByEmail()', () => {
    it('should either send email to apply if not in db, or send join email', async () => {
      const notYetApplied = 'not.applied@fakeemail.com';
      const config = new MockConfig();
      const checkFunc = spy(config, 'sendUserInvitationToApplyEmail');
      const mockTeamService = new TeamService(config);
      const otherTeamMember = await Hacker.findOne({
        where: {
          email: 'Joe.Smith@fakeemail.com'
        }
      });

      expect(otherTeamMember).to.not.be.equal(null);
      await mockTeamService.addNewMemberByEmail(otherTeamMember, notYetApplied);
      assert.calledOnce(checkFunc);
    });
  });
  describe('#removeUserFromTeam()', () => {
    it('should remove member from a team and notify other team members that it has happened.', async () => {
      const config = new MockConfig();
      const checkFunc = spy(config, 'sendUserRemovedEmail');
      const mockTeamService = new TeamService(config);
      const otherTeamMember = await Hacker.findOne({
        where: {
          email: 'Joe.Smith@fakeemail.com'
        }
      });
      expect(otherTeamMember).to.not.be.equal(null);
      await mockTeamService.removeUserFromTeam(otherTeamMember, 'Josephine.Smith@fakeemail.com');
      assert.called(checkFunc);
    });
  });
});
