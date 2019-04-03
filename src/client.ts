import { Client } from "discord.js";

const token = process.env.token || require("../authorization").token;
const client = new Client();

client.login(token);

export { client };
