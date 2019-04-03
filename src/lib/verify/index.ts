import { addMessageHandler, addCommand } from "../message";

import {
  Guild,
  GuildMember,
  TextChannel,
  DMChannel,
  GroupDMChannel,
  GuildChannel,
  Message,
  MessageReaction,
  RichEmbed,
  Channel
} from "discord.js";
import { client } from "../../client";
import { askString, choose } from "../prompt";

export function findOrMakeRole(name: string, guild: Guild) {
  let role = guild.roles.find(role => role.name === name);
  return role
    ? Promise.resolve(role)
    : guild.createRole({ name, mentionable: true });
}

export default async function verify(member: GuildMember) {
  // Slide into those DMs
  const dm = await member.createDM();

  const name = await askString(
    "Greetings, and welcome to the Byrnes Hall 5th Floor Discord server! To get started, we’ll need some information first. What is your name?",
    dm
  );

  const room = await askString(
    "Thanks. What room do you live in? *(e.g. A6, B2, etc.)*",
    dm
  );

  const college = await choose(
    "Which college are you in? (Engineering, Science, Computing, Pre-Professional Health, Undeclared / Don't know)",
    dm,
    [
      ["Engineering", "College of Engineering"],
      ["Science", "College of Science"],
      ["Computing", "College of Computing"],
      ["Pre-Professional Health", "College of Pre-Professional Health"],
      ["Undeclared", "Don't Know", "idk"]
    ]
  );
}

client.on("guildMemberAdd", verify);
