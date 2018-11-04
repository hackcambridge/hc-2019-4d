import { HackerInstance } from "../models/Hacker";

interface TeamServiceConfig {
  sendUserLeftTeamEmail(emailRecipient: string, emailLeaving: string);
}

interface TeamServiceInterface {
  /**
   * Takes a hacker who has applied and converts them to the "wants to be allocated to a team" state.
   */
  convertHackerToWantsTeam(hacker: HackerInstance): Promise<void>;

  /**
   * Takes a hacker who has applied and converts them to the "applying on their own" state.
   */
  convertHackerToApplyingOnOwn(hacker: HackerInstance): Promise<void>;

  /**
   * Upgrades all the unregistered invitee instances for the hacker's email into registered
   * invitee instances.
   */
  upgradeUnregisteredInvitees(hacker: HackerInstance): Promise<void>;

  /**
   * Takes a hacker and removes them from their team, notifying any other members of the team and
   * removing the team if there are no remaining members.
   */
  leaveTeam(hacker: HackerInstance): Promise<void>;
}

class TeamService implements TeamServiceInterface {
  /**
   * Takes a hacker who has applied and converts them to the "wants to be allocated to a team" state.
   */
  async convertHackerToWantsTeam(hacker: HackerInstance): Promise<void> {
    if (await hacker.getTeam() !== null) {
      await this.leaveTeam(hacker);
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
      await this.leaveTeam(hacker);
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
  leaveTeam(hacker: HackerInstance): Promise<void> {
    throw new Error('unimplemented');
  }

  /**
   * Upgrades all the unregistered invitee instances for the hacker's email into registered
   * invitee instances.
   */
  upgradeUnregisteredInvitee(): Promise<void> {
    throw new Error('unimplemented');
  }
}
