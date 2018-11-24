import Hacker, { HackerInstance } from 'server/models/Hacker';
import * as emailTemplates from '../../apply/email-templates';
import { sendEmail } from '../../email';

interface TeamServiceConfig {
  /**
   * Sends an email notifying another team member that someone has decided to leave that team
   * @param recipient A member of team who is being notified that someone in their team has left
   * @param leaving The hacker who has decided to leave
   */
  sendUserLeftTeamEmail(recipient: HackerInstance, leaving: HackerInstance): Promise<void>;

  /**
   * Sends an email when creating a team to those not in the database encouraging them to apply
   * @param recipient The email of the user who has not yet applied
   * @param from The Hacker who tried to add the new member to the team
   */
  sendUserInvitationToApplyEmail(recipient: string, from: HackerInstance): Promise<void>;

  /**
   * If the other members are in the database (they have applied), send them an email to join the team
   * @param recipient The email of the user who has not yet joined the team
   * @param from The Hacker who tried to add the new member to the team
   */
  sendUserInvitationToJoinEmail(recipient: HackerInstance, from: HackerInstance): Promise<void>;

  /**
   * An email to a user who has been removed by another member of team
   * @param removed The person who has been removed
   * @param emailRecipient Recipient of the email (all team members)
   * @param emailRemover The person who has removed another user.
   */
  sendUserRemovedEmail(removed: HackerInstance, recipient: HackerInstance, remover: HackerInstance): Promise<void>;
}

interface TeamServiceInterface {
  /**
   * Takes a hacker in an arbitrary state and converts them to the "wants to be allocated to a team" state.
   */
  convertHackerToWantsTeam(hacker: HackerInstance): Promise<void>;

  /**
   * Takes a hacker in an arbitrary state and converts them to the "applying on their own" state.
   */
  convertHackerToApplyingOnOwn(hacker: HackerInstance): Promise<void>;

  /**
   * Takes a hacker and removes them from their team, notifying any other members of the team and
   * removing the team if there are no remaining members.
   */
  leaveOwnTeam(hacker: HackerInstance): Promise<void>;

  /**
   * Takes a hacker who is inviting another user by email, if the email isn't signed up then sends an email to apply
   * otherwise check to see if user is in a team and if not email to join or return error that they already have a team
   */
  addNewMemberByEmail(hacker: HackerInstance, userEmail: string): Promise<void>;

  /**
   * Takes a hacker who is inviting another user by email, if the email isn't signed up then sends an email to apply
   * otherwise check to see if user is in a team and if not email to join or return error that they already have a team
   */
  addNewMemberByEmail(hacker: HackerInstance, userEmail: string): Promise<void>;

  /**
   * Takes a hacker who is removing another user by email, if the email is in the hacker's team then remove them and send email.
   * If the email is not in the team, then error.
   */
  removeUserFromTeam(hacker: HackerInstance, userEmail: string): Promise<void>;
}

class TeamService implements TeamServiceInterface {

  constructor(private config: TeamServiceConfig) {

  }

  /**
   * Takes a hacker who has applied and converts them to the "wants to be allocated to a team" state.
   */
  public async convertHackerToWantsTeam(hacker: HackerInstance): Promise<void> {
    if (await hacker.getTeam() !== null) {
      await this.leaveOwnTeam(hacker);
    }
    const application = await hacker.getHackerApplication();
    if (application === null) {
      throw new Error('TeamService.convertHackerToWantsTeam: expecting hacker to have applied.');
    }
    application.inTeam = false;
    application.wantsTeam = true;
    await application.save();
  }

  /**
   * Takes a hacker who has applied and converts them to the "applying on their own" state.
   */
  public async convertHackerToApplyingOnOwn(hacker: HackerInstance): Promise<void> {
    if (await hacker.getTeam() !== null) {
      await this.leaveOwnTeam(hacker);
    }
    const application = await hacker.getHackerApplication();
    if (application === null) {
      throw new Error('TeamService.convertHackerToWantsTeam: expecting hacker to have applied.');
    }
    application.inTeam = false;
    application.wantsTeam = false;
    await application.save();
  }

  /**
   * Takes a hacker and removes them from their team, notifying any other members of the team and
   * removing the team if there are no remaining members.
   */
  public async leaveOwnTeam(hacker: HackerInstance): Promise<void> {
    const teamMember = await hacker.getTeam();
    const team = await teamMember.getTeam();

    if (team.getTotalMembersCount() === 1) {
      await teamMember.destroy();
      await team.destroy();
    } else {
      await teamMember.destroy();
      const members = await Promise.all(team.teamMembers.map(async member => {
        const otherHacker = await member.getHacker();
        return otherHacker;
      }));

      await Promise.all(members.map(member => {
        return this.config.sendUserLeftTeamEmail(member, hacker);
      }));
    }
  }

  /**
   * Adds a new member to a current hacker's team, if they haven't applied it prompts them to do so.
   * If they have applied, then it sends an email to prompt them to join otherwise if they already have a team
   * an error is thrown.
   */
  public async addNewMemberByEmail(hacker: HackerInstance, userEmail: string): Promise<void> {
    const newHacker = await Hacker.findOne({
      where: {
        email: userEmail
      }
    });
    if (newHacker === null) {
      // Hacker not in the database, so invite them to apply
      this.config.sendUserInvitationToApplyEmail(userEmail, hacker);
    } else {
      const team = await newHacker.getTeam();
      if (team === null) {
        // Hacker in database and they currently have no team
        this.config.sendUserInvitationToJoinEmail(newHacker, hacker);
      } else {
        // Already in database and have team error
        throw new Error('Already have a team');
      }
    }
  }

  /**
   * Removes a member from a team and notifies all other team members (including the one removed) that it has happened.
   */
  public async removeUserFromTeam(hacker: HackerInstance, userEmail: string): Promise<void> {
    const teamMember = await hacker.getTeam();
    const team = await teamMember.getTeam();
    const hackerPromises = team.teamMembers.map(async member => {
      const otherHacker = await member.getHacker();
      return otherHacker;
    });

    const hackers = await Promise.all(hackerPromises);

    const inTeamIndex = hackers.findIndex(member => member.email === userEmail);

    if (inTeamIndex !== -1) {
      const removedHacker = await team.teamMembers[inTeamIndex].getHacker();
      team.teamMembers[inTeamIndex].destroy();
      hackers.map(member => {
        // Don't send email to the person removing the member of the team
        if (member.email !== hacker.email) {
          this.config.sendUserRemovedEmail(removedHacker, member, hacker);
        }
      });
    } else {
      // If they're not in the team error
      throw new Error('Not in the Team');
    }
  }
}

// tslint:disable-next-line:max-classes-per-file
class TeamConfig implements TeamServiceConfig {
  public async sendUserLeftTeamEmail(recipient: HackerInstance, leaving: HackerInstance) {
    const contents = emailTemplates.userLeftTeamEmail(recipient, leaving);
    await sendEmail({ to: recipient, contents });
  }
  public async sendUserInvitationToApplyEmail(recipient: string, from: HackerInstance) {
    const contents = emailTemplates.invitationToApplyEmail(recipient, from);
    await sendEmail({ to: recipient, contents });
  }
  public async sendUserInvitationToJoinEmail(recipient: HackerInstance, from: HackerInstance) {
    const contents = emailTemplates.invitationToJoinEmail(recipient, from);
    await sendEmail({ to: recipient, contents });
  }
  public async sendUserRemovedEmail(removed: HackerInstance, recipient: HackerInstance, remover: HackerInstance) {
    const contents = emailTemplates.userRemovedEmail(removed, recipient, remover);
    await sendEmail({ to: recipient, contents });
  }
}
