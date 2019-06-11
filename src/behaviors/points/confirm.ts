import { RichEmbed, TextChannel } from "discord.js";
import { client } from "../../client";

export default async function confirm(
  points: { [key: string]: number },
  {
    involved,
    date,
    boss,
    tanked,
    length,
    picture,
    splitter,
    discord,
    invoker
  }: {
    involved: string[];
    date: string;
    boss: string;
    tanked: string;
    length: string;
    picture: string;
    splitter: string;
    discord: string[];
    invoker: string;
  }
) {
  const embed = new RichEmbed().setTimestamp().setTitle("Point Application");

  // Set author
  let submitter = client.users.get(invoker);
  embed.setAuthor(submitter.username, submitter.avatarURL);

  let tank = client.users.get(tanked);

  embed
    .addField("Date", date)
    .addField("Defeated Boss", boss)
    .addField("Team", involved.map(i => `${client.users.get(i)}`).join(", "))
    .addField("Tank", tank.toString())
    .addField("Length", length)
    .addField("Picture", picture)
    .addField("Loot Splitter", client.users.get(splitter))
    .addField(
      "People in Discord Call",
      discord.map(i => `${client.users.get(i)}`).join(", ")
    )
    .addField(
      "Point Distribution",
      Object.keys(points)
        .map(id => `${client.users.get(id)}: ${points[id]} pts`)
        .join("\n")
    );

  const channel = client.channels.get("583525533401219072") as TextChannel;

  await channel.send({ embed });
}
