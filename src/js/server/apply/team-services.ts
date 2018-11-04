import Hacker, { HackerInstance } from "../models/Hacker";
import { Team } from "../models";


async function addNewMemberByEmail(hacker: HackerInstance, userEmail: string) {
  const newHacker = await Hacker.findOne({
    where: {
      email: userEmail
    }
  });

  if (newHacker === null) {
      //Invite using email
  } else {
    const team = await newHacker.getTeam();
    if (team === null) {
      //Send do you want to join team?
    } else {
      //Error: Already in team
    }
  }
}

async function leaveTeam(hacker: HackerInstance, user: HackerInstance) {
  const team = await user.getTeam();
  //getSize needs implementing
  if (team.getSize() == 1) {
    //Delete Team
  } else {
    //Remove and email the members
  }
}

async function removeUserFromTeam(hacker: HackerInstance, userEmail: string) {
  const teamMember = await hacker.getTeam();
  const team = await teamMember.getTeam();

  team.teamMembers.map(member => {
    const otherHacker = await member.getHacker()
    otherHacker.email
  })

  team.getHacker
}

interface TeamServices {
    addNewMemberByEmail(hacker: HackerInstance, userEmail: string);
    leaveTeam(hacker: HackerInstance, user: HackerInstance);
    removeUserFromTeam(hacker: HackerInstance, userEmail: string);
}

