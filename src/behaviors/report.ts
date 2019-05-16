import { Client, DiscordAPIError } from "discord.js";
import { MAYORMONTY } from "../commands/debug";

export default function report(client: Client) {
  return async (error: Error) => {
    let me = await client.fetchUser(MAYORMONTY);

    me.send(error.stack);
  };
}
