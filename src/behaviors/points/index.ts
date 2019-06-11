import { GuildMember, DMChannel } from "discord.js";
import { askString, choose } from "../../lib/prompt";
import { client } from "../../client";
import confirm from "./confirm";
import allocatePoints from "./allocate";

const { bosses, tankable } = require("../../../config.json");

function getPoints(number: number, unit: string) {
  unit = unit.toLowerCase();
  if (unit === "hours" || unit === "hour") {
    number *= 2;
  }

  return number * 5;
}

async function displayPoints(dm: DMChannel, points: { [key: string]: number }) {
  for (let id in points) {
    await dm.send(`${client.users.get(id)}: ${points[id]} points`);
  }
}

export default async function assignPoints(member: GuildMember) {
  // Slide into the dms
  const dm = await member.createDM();

  // Get Date
  const date = await askString(
    "Date of the boss / raid trip? (MM / DD / YYYY)",
    dm
  );

  await dm.send("Boss List");
  await dm.send(bosses.map(boss => `${boss[0]}`).join("\n"));

  const boss = await choose(
    "What boss did you kill? (Refer to the list for exact names)",
    dm,
    bosses
  );

  // Get members in discord by username
  const nicks = member.guild.members.map(member => [
    member.user.id,
    member.user.username
  ]);
  let done = false;

  const involved = [] as string[];
  let points: { [key: string]: number } = {};

  await dm.send(
    "Enter all of the Discord usernames of everyone involved in the raid (one by one). Once you're done, enter `DONE`"
  );

  do {
    let out = await choose(
      "Who was involved? (one person at a time, Discord usernames). When finished, enter `DONE`",
      dm,
      [...nicks, ["DONE"]]
    );
    if (out === "DONE") {
      done = true;
    } else {
      if (involved.includes(out)) {
        await dm.send("That person has already been included!");
      } else {
        involved.push(out);
        points[out] = 0;
      }
    }
  } while (!done);

  const users = involved.map(id => client.users.get(id));
  await dm.send(
    `The following people have been included: ${users
      .map(r => `${r}`)
      .join(", ")}`
  );

  let number, unit;

  do {
    [number, unit] = (await askString(
      "How long was the trip? (hours or number or raids). For example, specify the trip was `5 hours` or `7 raids`",
      dm
    )).split(" ");

    if (!number || !unit) {
      await dm.send("Not sure what you mean.");
    }
  } while (!number || !unit);

  const basePoints = getPoints(+number, unit);

  // Assign base value to each person involved
  for (const user in points) {
    points[user] += basePoints;
  }

  let tanked = "N/A";

  if (tankable.includes(boss)) {
    tanked = await choose(
      "Who tanked? (Discord username)",
      dm,
      users.map(user => [user.id, user.username])
    );

    // Assign extra points for the tank
    points[tanked] *= 2;
  }

  // Get the picture
  const picture = await askString(
    "Submit a total loot picture (put the URL here). You may also put N/A, but this will nullify any extra points from the split.",
    dm
  );

  let splitter = "N/A";

  if (picture.toLowerCase() === "n/a") {
    await dm.send("No extra points will be assigned for splits");
  } else {
    // Split contributions
    for (let user of users) {
      const contribution = +(await askString(
        `How much did ${user} contribute towards the split? (please enter exact numbers)`,
        dm
      )).replace(/[^0-9]/g, "");

      // Double points if split is > 50mil
      if (contribution > 50000000) {
        points[user.id] += (contribution / 1000000) * 2;
      } else {
        points[user.id] += contribution / 1000000;
      }
    }

    splitter = await choose(
      "Who split the loot?",
      dm,
      users.map(u => [u.id, u.username])
    );
  }

  const discord = [] as string[];
  done = false;

  await dm.send(
    "Enter all of the Discord usernames of everyone in the discord voice chat (one by one). Once you're done, enter `DONE`"
  );

  do {
    let out = await choose(
      "Who was in the Discord Voice Chat during the Bossing? (one person at a time, Discord usernames). When finished, enter `DONE`",
      dm,
      [...nicks, ["DONE"]]
    );
    if (out === "DONE") {
      done = true;
    } else {
      if (discord.includes(out)) {
        await dm.send("That person has already been included!");
      } else {
        discord.push(out);
        points[out] += 5;
      }
    }
  } while (!done);

  // Assign bonus points if everyone is in voice call
  if (involved.every(id => discord.includes(id))) {
    discord.forEach(id => (points[id] += 15));
  }

  // Add 10pts to the submitter
  points[member.id] += 10;

  await displayPoints(dm, points);

  const go = await choose(
    "Points will be assigned as above. Is this okay? (y/n)",
    dm,
    [["yes", "y", "yeet", "ya"], ["no", "n", "nah"]]
  );

  if (go === "YES") {
    await dm.send("Sent for confirmation.");

    const approved = await confirm(points, {
      involved,
      date,
      boss,
      tanked,
      length: [number, unit].join(" "),
      picture,
      discord,
      splitter,
      invoker: member.id
    });

    if (approved) {
      await dm.send("Report was approved! Points being assigned now.");
      await allocatePoints(points);
    } else {
      const startover = await choose(
        "Report was *not* approved. Would you like to start over?",
        dm,
        [["yes", "y", "yeet", "ya"], ["no", "n", "nah"]]
      );

      if (startover === "YES") {
        await assignPoints(member);
      }
    }
  } else {
    const startover = await choose(
      "Draft *not* submitted. Would you like to start over?",
      dm,
      [["yes", "y", "yeet", "ya"], ["no", "n", "nah"]]
    );

    if (startover === "YES") {
      await assignPoints(member);
    }
  }
}
