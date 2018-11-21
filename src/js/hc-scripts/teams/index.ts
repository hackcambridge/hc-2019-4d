import addMember from './add-member';
import get from './get';
import send from './send';
import suggest from './suggest';

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
