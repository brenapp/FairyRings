import { RichEmbed, TextChannel, Message, User } from "discord.js";
import { client } from "../../client";

const configuration = require("../../../config");

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
    invoker,
    split
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
    split: { [key: string]: number };
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
    .addField("Team", involved.map(i => `${client.users.get(i)}`).join(", "));

  if (tank) {
    embed.addField("Tank", tank.toString());
  }
  embed
    .addField("Length", length)
    .addField("Picture", picture)
    .addField("Loot Splitter", client.users.get(splitter))
    .addField(
      "People in Discord Call",
      discord.map(i => `${client.users.get(i)}`).join(", ") || "None"
    )
    .addField(
      "Loot Split",
      Object.keys(split)
        .map(id => `${client.users.get(id)}: ${split[id]} pts`)
        .join("\n")
    )
    .addField(
      "Point Distribution",
      Object.keys(points)
        .map(id => `${client.users.get(id)}: ${points[id]} pts`)
        .join("\n")
    );

  const channel = client.channels.get(
    configuration.channels.approve
  ) as TextChannel;

  const approval = (await channel.send({ embed })) as Message;

  await Promise.all([approval.react("👍"), approval.react("👎")]);

  return new Promise((resolve, reject) => {
    const collector = approval.createReactionCollector(
      (vote, usr: User) =>
        (vote.emoji.name === "👎" || vote.emoji.name === "👍") && !usr.bot
    );
    let handleReaction;
    collector.on(
      "collect",
      (handleReaction = vote => {
        const approver = vote.users.last();

        if (vote.emoji.name === "👍") {
          approval.edit(
            embed.addField("Outcome", `Approved by ${approver.toString()}`)
          );

          if (collector.off) {
            collector.off("collect", handleReaction);
          }
          resolve(true);
        } else {
          approval.edit(
            embed.addField("Outcome", `Denied by ${approver.toString()}`)
          );
        }
        collector.emit("end");
        approval.clearReactions();

        resolve(false);
      })
    );
    collector.on("end", () => {});
  }) as Promise<boolean>;
}
