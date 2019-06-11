import { addCommand } from "../lib/message";
import assignPoints from "../behaviors/points";
import { client } from "../client";

addCommand("pointapp", async (args, message) => {
  await message.react("👍");

  assignPoints(message.member);
  return true;
});
