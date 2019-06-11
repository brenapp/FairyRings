import { GuildMember, DMChannel } from "discord.js";
import { askString, choose } from "../../lib/prompt";
import { client } from "../../client";

const bosses = [
  ["Barbarian Assault"],
  ["Callisto"],
  ["Chaos Elemental"],
  ["Chambers of Xeric (CoX Raids 1)"],
  ["Commander Zilyana (Saradomin GWD)"],
  ["Corporeal Beast"],
  ["Dagannoth Kings"],
  ["General Graardor (Bandos GWD)"],
  ["Giant Mole"],
  ["K’ril Tsutsaroth (Zamorak GWD)"],
  ["Kalphite Queen"],
  ["King Black Dragon"],
  ["Kree’arra (Armadyl GWD)"],
  ["Pest Control"],
  ["Scorpia"],
  ["Theatre of Blood (ToB Raids 2)"],
  ["Venenatis"],
  ["Vet’ion"],
  ["Wintertodt"]
];

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
      "Who was involved? (one person at a time, Discord usernames)",
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

  const [number, unit] = (await askString(
    "How long was the trip? (hours or number or raids)",
    dm
  )).split(" ");
  const basePoints = getPoints(+number, unit);

  // Assign base value to each person involved
  for (const user in points) {
    points[user] += basePoints;
  }

  await displayPoints(dm, points);

  const tanked = await choose(
    "Who tanked? (Discord username)",
    dm,
    users.map(user => [user.id, user.username])
  );

  // Assign extra points for the tank
  points[tanked] *= 2;

  await displayPoints(dm, points);

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
        `How much did ${user} contribute towards the split?`,
        dm
      )).replace(/[^0-9]/g, "");

      console.log(user.username, contribution);

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

  await displayPoints(dm, points);

  const discord = [] as string[];
  done = false;

  await dm.send(
    "Enter all of the Discord usernames of everyone in the discord voice chat (one by one). Once you're done, enter `DONE`"
  );

  do {
    let out = await choose(
      "Who was in the Discord Voice Chat during the Bossing? (one person at a time, Discord usernames)",
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

  for (let id in points) {
    await dm.send(`${client.users.get(id)}: ${points[id]} points`);
  }

  const confirm = await choose(
    "Points will be assigned as above. Is this okay (y/n)",
    dm,
    [["yes", "y", "yeet", "ya"], ["no", "n", "nah"]]
  );

  if (confirm === "yes") {
    await dm.send("Confirmed.");
  } else {
    await dm.send("Not confirmed. You can start over");
  }
}
