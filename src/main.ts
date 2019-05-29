import discord from "discord.js";
import { handleMessage } from "./lib/message";

import report from "./behaviors/report";
import { client } from "./client";

import "./behaviors";
import "./commands";

client.on("ready", () => {
  console.log("ByrnesBot#9971 is online!");

  if (process.env["DEV"]) {
    client.user.setActivity("with VSCode", { type: "PLAYING" });
  } else {
    client.user.setActivity("over the server", { type: "WATCHING" });
  }
});

const reporter = report(client);
process.on("uncaughtException", reporter);
process.on("unhandledRejection", reporter);

client.on("message", handleMessage);
client.on("error", report);
