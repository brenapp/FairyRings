import { addCommand } from "../lib/message";
import { RichEmbed } from "discord.js";

addCommand("contact", async (args, message) => {
  const embed = new RichEmbed({
    title: "Contact Information",
    fields: [
      { name: "B/L RA-On Call", value: "(864) 656-1118 (Non-emergency)" },
      {
        name: "CUPD / CAPS On-Call:",
        value: "(864) 656-2222 (Immediate emergency)"
      },
      {
        name: "Maintenance",
        value: "(864) 656-5450"
      },
      {
        name: "Zach’s Phone/Email",
        value: ["(803) 546-9216", "zelindl@g.clemson.edu"].join("\n")
      },
      {
        name: "Sean’s Phone/Email",
        value: ["(XXX) XXX-XXXX", "@g.clemson.edu"].join("\n")
      }
    ]
  });

  message.channel.send(embed);

  return true;
});
