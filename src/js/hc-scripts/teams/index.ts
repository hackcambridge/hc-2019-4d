import get from "./get";
import addMember from "./add-member";
import suggest from "./suggest";
import send from "./send";

export default {
  command: 'teams',
  desc: 'Operate on teams',
  aliases: [],
  builder(yargs) {
    return yargs
      .command(get)
      .command(addMember)
      .command(suggest)
      .command(send)
      .demand(1);
  },
  handler: () => { },
};
