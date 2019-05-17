import { addMessageHandler, addCommand } from "../../lib/message";

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
import { askString, choose } from "../../lib/prompt";
import checkRoom from "./room";

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

  let verified = false;
  let override = false;

  let room: string, cuid: string;

  do {
    room = await askString(
      "What room do you live in? *(e.g. A6, B2, etc.)*",
      dm
    );

    if (room === "OVERRIDE") {
      override = true;
      break;
    }

    cuid = await askString("Finally, what's your CUID?", dm);

    if (cuid === "OVERRIDE") {
      override = true;
      break;
    }

    verified = await checkRoom(room, cuid);

    if (!verified) {
      dm.send(
        "There doesn't appear to be anyone with that CUID in that room. Check your details. You can also override this check by entering OVERRIDE"
      );
    }
  } while (!verified && !override);

  // Get a reason for override if they did
  let reason: string;
  if (override) {
    reason = await askString(
      "Please enter your reason for override below. This will be visible to admins",
      dm
    );
  }

  const approve = client.channels.find(
    channel =>
      channel.type === "text" &&
      (channel as TextChannel).name === "member-approval"
  ) as TextChannel;

  dm.send(
    "You're all set! Your verification should be approved shortly. Sit tight!"
  );

  console.log("VERIFY", name, room, college, major, cuid);

  const embed = new RichEmbed({
    title: `Verification for **${name}**`,
    description: `Room #${room}; CUID ${cuid}`,
    author: {
      name
    },
    fields: [
      {
        name: "Field of Study",
        value: `School of ${college} / ${major}`
      },
      {
        name: verified ? "CUID Verified" : "CUID **Not** Verified",
        value: override ? reason : "Room & CUID match"
      },
      {
        name: "Verification Procedure",
        value:
          "React with :thumbsup: to approve. To deny and kick, react with :thumbsdown: (make sure to give reasoning in #verification)"
      }
    ]
  });

  let approval = (await approve.send(embed)) as Message;

  await Promise.all([approval.react("👍"), approval.react("👎")]);

  const collector = approval.createReactionCollector(
    (vote, usr) =>
      (vote.emoji.name === "👎" || vote.emoji.name === "👍") &&
      usr !== client.user
  );

  let handle;
  collector.on(
    "collect",
    (handle = vote => {
      const approver = vote.users.last();

      if (vote.emoji.name === "👍") {
        approval.edit(
          embed.addField("Outcome", `Approved by ${approver.toString()}`)
        );
      } else {
        approval.edit(
          embed.addField(
            "Outcome",
            `Denied and Kicked by ${approver.toString()}`
          )
        );
        member.kick("Verification denied.");
        member.send(
          `Your verification was denied. Check your information and try again. You can interact with RAs in ${client.channels.find(
            c => c.type === "text" && (c as TextChannel).name === "verification"
          )}`
        );
      }

      approval.clearReactions();
      collector.off("collect", handle);
    })
  );
}

client.on("guildMemberAdd", verify);
