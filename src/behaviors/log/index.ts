import { addMessageHandler, addCommand } from "../../lib/message";
import { TextChannel } from "discord.js";
import { client } from "../../client";

// Dismiss messages from a bot, we don't take their kind around here!
addMessageHandler(message => message.author.bot);

// Message Logging
addMessageHandler(message => {
  let log;
  if (message.channel.type === "dm") {
    return false;
  } else {
    log = message.guild.channels.find(
      channel => channel.name === "server-log"
    ) as TextChannel;
  }

  if (!log) return false;

  log.send(
    `${message.member.user.username}#${message.member.user.discriminator} in ${
      message.type === "dm" ? "DM" : message.channel.toString()
    }: ${message.content}`
  );
  return false;
});

client.on("messageUpdate", (old, current) => {
  let log;
  if (old.channel.type === "dm") {
    return false;
  } else {
    log = old.guild.channels.find(
      channel => channel.name === "server-log"
    ) as TextChannel;
  }

  if (!log) return false;

  log.send(
    `${old.member.user.username}#${old.member.user.discriminator} in ${
      old.type === "dm" ? "DM" : old.channel.toString()
    }: ${old.content} => ${current.content}`
  );
});
