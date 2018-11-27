
import { expect } from 'chai';
import { Hacker, HackerInstance } from 'server/models';
import { TeamService, TeamServiceConfig } from '../src/server/routes/apply/team-service';

class MockConfig implements TeamServiceConfig {
  public sendUserLeftTeamEmail(recipient: HackerInstance, leaving: HackerInstance): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(`sendUserInvitationToApplyEmail(${recipient}, ${leaving}`));
      }, 300);
    });
  }

  public sendUserInvitationToApplyEmail(recipient: string, from: HackerInstance): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(`sendUserInvitationToApplyEmail(${recipient}, ${from}`));
      }, 300);
    });
  }

  public sendUserInvitationToJoinEmail(recipient: HackerInstance, from: HackerInstance): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(`sendUserInvitationToJoinEmail(${recipient}, ${from}`));
      }, 300);
    });
  }

  public sendUserRemovedEmail(removed: HackerInstance, recipient: HackerInstance, remover: HackerInstance): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(`sendUserRemovedEmail(${removed}, ${recipient}, ${remover}`));
      }, 300);
    });
  }
}

const mockTeamService = new TeamService(new MockConfig());

describe('Team Service', () => {
  describe('#leaveOwnTeam()', () => {
    it('should remove member from team, deleting team if last and sending email to all others', async () => {
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

      expect(hackerToRemove).to.not.equal(null);

      mockTeamService.leaveOwnTeam(hackerToRemove).then( async () => {
        const teamMember = await otherTeamMember.getTeam();
        const team = await teamMember.getTeam();
        const emails = team.teamMembers.map(async member => {
          const hacker = await member.getHacker();
          return hacker.email;
        });
        expect(emails).to.not.include('Joe.Blogs@fakeemail.com');
      });
    });
  });
});
