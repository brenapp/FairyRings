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

const config: {
  majors: { [college: string]: string[] };
} = require("../../../config");

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

  let college, major;

  do {
    college = await choose(
      "Which college are you in? (Engineering, Science, Computing, Pre-Professional Health, Undeclared / Don't know)",
      dm,
      [
        ...Object.keys(config.majors).map(a => [a, `College of ${a}`]),
        ["Undeclared", "Don't Know", "idk"]
      ]
    );

    if (college === "UNDECLARED") {
      const confirmation = await choose("Confirm undeclared? (y/n)", dm, [
        ["y", "yes", "yeah", "yep", "yeet"],
        ["n", "no", "nope"]
      ]);

      major = confirmation === "Y" ? college : "BACK";
    } else {
      major = await choose(
        `Thanks! Which of these is your major?\n\n${config.majors[college]
          .map(m => `*${m}*`)
          .join("\n")}\n\n You can say back to reselect your college`,
        dm,
        [...config.majors[college].map(a => [a]), ["back"]]
      );
    }
  } while (major === "BACK");

  const cuid = await askString("Finally, what's your CUID?", dm);

  dm.send(
    `Hi ${name}! You live in ${room} and you are studying ${major} in the College of ${college}`
  );

  console.log("VERIFY", name, room, college, major, cuid);
}

client.on("guildMemberAdd", verify);
