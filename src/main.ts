import discord from "discord.js";
import { handleMessage } from "./lib/message";

import report from "./lib/report";
import { client } from "./client";

import "./behaviors";
import "./commands";

client.on("ready", () => {
  console.log("ByrnesBot#9971 is online!");
  client.user.setActivity("over the server", { type: "WATCHING" });
});

const reporter = report(client);
process.on("uncaughtException", reporter);
process.on("unhandledRejection", reporter);

client.on("message", handleMessage);
client.on("error", report);
