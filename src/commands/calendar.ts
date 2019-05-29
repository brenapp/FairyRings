import { addCommand } from "../lib/message";
import fetch from "isomorphic-fetch";
import Parser from "rss-parser";
import { RichEmbed } from "discord.js";

const parser = new Parser();

const CALENDAR =
  "https://calendar.clemson.edu/calendar.xml?event_types%5B%5D=34564";

async function getEvents() {
  const feed = await parser.parseURL(CALENDAR);
  return feed.items;
}

addCommand("calendar", async (args, message) => {
  let events = (await getEvents()).slice(0, +args[0] || 5);

  const embed = new RichEmbed({
    title: "Academic Calendar",
    fields: events.map(event => ({
      name: new Date(event.isoDate).toLocaleDateString(),
      value: `[${event.title.split(":")[1]}](${event.link})`
    }))
  });

  message.channel.send(embed);

  return true;
});
