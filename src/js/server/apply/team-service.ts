import Hacker, { HackerInstance } from "../models/Hacker";
import { TeamInstance } from "../models/Team";

interface TeamServiceConfig {
  sendUserLeftTeamEmail(emailRecipient: string, emailLeaving: string): Promise<void>;
  sendUserInvitationToApplyEmail(emailRecipient: string, emailFrom: string): Promise<void>;
  sendUserInvitationToJoinEmail(emailRecipient: string, emailFrom: string): Promise<void>;
  sendUserRemovedEmail(emailRecipient: string, emailRemover: string): Promise<void>;
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
  async convertHackerToWantsTeam(hacker: HackerInstance): Promise<void> {
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
  async convertHackerToApplyingOnOwn(hacker: HackerInstance): Promise<void> {
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
  async leaveOwnTeam(hacker: HackerInstance): Promise<void> {
    const teamMember = await hacker.getTeam();
    const team = await teamMember.getTeam();

    if (team.getTotalMembersCount() == 1) {
      await teamMember.destroy();
      await team.destroy();
    } else {
      await teamMember.destroy();
      const emails = await Promise.all(team.teamMembers.map(async member => {
        const otherHacker = await member.getHacker();
        return otherHacker.email;
      }));

      await Promise.all(emails.map(email => {
        return this.config.sendUserLeftTeamEmail(email, hacker.email);
      }));
    }
  }

  async addNewMemberByEmail(hacker: HackerInstance, userEmail: string): Promise<void> {
    const newHacker = await Hacker.findOne({
      where: {
        email: userEmail
      }
    });
  
    if (newHacker === null) {
      //Hacker not in the database, so invite them to apply
      this.config.sendUserInvitationToApplyEmail(userEmail, hacker.email);
    } else {
      const team = await newHacker.getTeam();
      if (team === null) {
        //Send do you want to join team?
        this.config.sendUserInvitationToJoinEmail(userEmail, hacker.email);
      } else {
        //Error: Already in team
        throw new Error("Unimplemented");
      }
    }
  }

  async removeUserFromTeam(hacker: HackerInstance, userEmail: string): Promise<void> {
    const teamMember = await hacker.getTeam();
    const team = await teamMember.getTeam();
  
    const emailPromises = team.teamMembers.map(async member => {
      const otherHacker = await member.getHacker();
      return otherHacker.email;
    });

    const emails = await Promise.all(emailPromises);

    const inTeamIndex = emails.findIndex(email => email === userEmail);

    if(inTeamIndex !== -1) {
      team.teamMembers[inTeamIndex].destroy();
      this.config.sendUserRemovedEmail(userEmail, hacker.email);
    } else {
      throw new Error("Unimplemented");
    }
  }
}
