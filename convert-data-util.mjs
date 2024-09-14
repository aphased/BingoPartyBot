import JSONdb from "simple-json-db";
// import * as players from "./data/playerNamesOldFormat.json" assert { type: "json" };
import * as players from "./data/playerNamesOldFormat.json" with { type: "json" };
import axios from "axios";

let db = new JSONdb("./data/playerNamesUpdatedFormat.json");
db.set("players", []);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const Permissions = Object.freeze({
  ExSplasher: 0,
  Hob: 1,
  Famous: 1,
  Splasher: 2,
  Trusted: 2,
  Admin: 3,
  Staff: 3,
  Owner: 4,
  BotAccount: 4,
});

for (let x of players.default) {
  let data = [];
  for (let y of x.names) {
    let uuid = await getUUID(y);
    data.push({
      name: y,
      uuid: uuid,
    });
    // Wait for 1 second before the next iteration
    await delay(1000);
  }
  let d = db.get("players");
  d.push({
    accounts: data,
    permissionRank: Permissions[capitalizeFirstLetter(x.permissionRank)],
  });
  db.set("players", d);
}

async function getUUID(username) {
  let data = await axios
    .get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    .catch((e) => {
      // console.log(e)
      console.log("Error with user " + username);
    });
  if (!data) {
    console.log("Skipping " + username);
    return null;
  }
  if (data.data.errorMessage) return null;
  return data.data.id;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
