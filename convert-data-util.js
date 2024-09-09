import JSONdb from "simple-json-db";
import * as players from "./data/playerNamesOldFormat.json" assert { type: "json" };
import axios from "axios";
import { log } from "./modules/utils.mjs";

let db = new JSONdb("./data/playerNamesUpdatedFormat.json");
db.set("players", []);
players.default.forEach((player) => {
  let data = [];
  for (let x of player.names) {
    setTimeout(async () => {
      let uuid = await getUUID(x);
      data.push({
        name: x,
        uuid: uuid,
      });
      log("Finished user " + x);
    }, 1000);
  }
  let d = db.get("players");
  d.push({
    accounts: data,
    permissionRank: player.permissionRank,
  });
  db.set("players", d);
});

async function getUUID(username) {
  let data = await axios.get(
    `https://api.mojang.com/users/profiles/minecraft/${username}`,
  );
  if (data.data.errorMessage) return null;
  return data.data.id;
}
