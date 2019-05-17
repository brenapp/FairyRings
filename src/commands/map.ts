import { addCommand } from "../lib/message";

addCommand("map", async (args, message) => {
  message.channel.send(
    "https://www.clemson.edu/campus-map/pdfs/campus-map.pdf"
  );

  return true;
});
