import { addCommand } from "../lib/message";
import { client } from "../client";

import * as vexdb from "vexdb";
import keya from "keya";

export const MAYORMONTY = "274004148276690944";

function okay(message) {
  return message.author.id === MAYORMONTY;
}

addCommand("grant", (args, message) => {
  // Exclusive to myself
  if (!okay(message)) {
    return false;
  }

  const role = message.guild.roles.find(role => role.name === args.join(" "));
  message.member.addRole(role);
});

let DEBUG = false;

addCommand("debug", (args, message) => {
  if (!okay(message)) {
    return false;
  }

  DEBUG = !DEBUG;

  message.channel.send(`Debug ${DEBUG ? "ENABLED" : "DISABLED"}`);
});
