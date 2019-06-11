import { client } from "../../client";
import { TextChannel } from "discord.js";

const configuration = require("../../../config");

export default async function allocatePoints(points: { [id: string]: number }) {
  const channel = client.channels.get(
    configuration.channels.assign
  ) as TextChannel;

  for (let id in points) {
    await channel.send(`$addpoints ${client.users.get(id)} ${points[id]}`);
  }
}
