import { addCommand } from "../message";
import verify from "../verify";

addCommand("verify", (args, message) => {
  message.mentions.members.forEach(member => verify(member));
  return true;
});
