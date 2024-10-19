// quick script to update playerNames db to the new preferredAccount system, also enforce correct uuids and names
// new db file will be generated as "playerNamesUpdated.json"
// if any errors are logged, investigate their origin before using the generated data

import JSONdb from "simple-json-db";
import axios from "axios";
import * as path from "path";
const __dirname = import.meta.dirname;

// path import needed for parent dir ("..")
let db = new JSONdb(
  path.join(__dirname, "..", "data", "playerNames.json"),
);
let data = db.get("data");

if (!data) {
  console.log(
    "Coudldn't load playerNames database file! Make sure data/playerNames.json exists and contains player data!",
  );
  process.exit(1);
}

const startTimestamp = Date.now();

let newData = [];

for (let i = 0; i < data.length; i++) {
  let user = data[i];
  let newUser = { accounts: [], permissionRank: user.permissionRank };

  // making sure all accounts are valid, have uuids and correctly capitalised usernames
  for (let acc of user.accounts) {
    let errtype;
    if (!acc.uuid) {
      try {
        const response = await axios.get(
          `https://api.mojang.com/users/profiles/minecraft/${acc.name}`,
        );
        acc.name = response.data.name;
        acc.uuid = response.data.id;
      } catch (err) {
        if (err?.response?.status === 404)
          errtype = "data"; // invalid account data
        else errtype = "request"; // request failed (network of rate limit)
        // console.log(err)
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // this endpoint's rate limit seems to be ~30/min
    } else {
      // use uuid based api endpoint to validate username if possible (accounts for name changes, also much higher rate limit)
      try {
        const response = await axios.get(
          `https://sessionserver.mojang.com/session/minecraft/profile/${acc.uuid}`,
        );
        acc.name = response.data.name;
      } catch (err) {
        if (err?.response?.status === 400)
          errtype = "data"; // invalid account data
        else errtype = "request"; // request failed (network or rate limit)
        // console.log(err)
      }
      await new Promise((resolve) => setTimeout(resolve, 100)); // this endpoint's rate limit seems to be exactly 1700/min
    }
    if (errtype) {
      if (errtype === "request")
        console.log(
          // rate limit or other network/request issue
          `API request error while getting info for account ${acc.name} (uuid: ${acc.uuid})`,
        );
      else if (errtype === "data")
        // name likely changed and storing uuids wasn't enforced
        console.log(`Invalid account data, skipping: ${acc.name} (uuid: ${acc.uuid})`);
      continue; // skip account
    }
    if (newUser.accounts.some((a) => a.uuid === acc.uuid))
      console.log(`Removing duplicate account ${acc.name} (uuid: ${acc.uuid})`);
    else newUser.accounts.push(acc);
  }
  if (newUser.accounts.length < 1) continue;
  // if possible, migrate preferredName to preferredAccount
  if (user.preferredName) {
    const preferredAcc = newUser.accounts.find(
      (acc) => acc.name.toLowerCase() === user.preferredName.toLowerCase(),
    );
    if (preferredAcc) newUser.preferredAccount = preferredAcc.uuid;
  }
  if (user.discord) newUser.discord = user.discord;
  // preferredAccount, hideRank and hypixelRank per account can be left empty to automatically be set when a party command is sent

  newData.push(newUser);
}

let newDB = new JSONdb(path.join(__dirname, "..", "data", "playerNamesUpdated.json"),);
newDB.set("data", newData);

const secondsElapsed = Math.round(Date.now()/10-startTimestamp/10)/100;
console.log(`Finished updating database in ${secondsElapsed}s! New db saved as "data/playerNamesUpdated.json".`)
