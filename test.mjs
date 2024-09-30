// import JSONdb from "simple-json-db";
// import * as players from "./data/playerNamesOld.json" assert { type: "json" };
// import axios from "axios";

import Utils, { utils } from "./src/utils/Utils.mjs";

// let db = new JSONdb("./playerNamesUpdated.json");
// db.set("players", []);

// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// const Permissions = Object.freeze({
//   ExSplasher: 0,
//   Hob: 1,
//   Famous: 1,
//   Splasher: 2,
//   Trusted: 2,
//   Admin: 3,
//   Staff: 3,
//   Owner: 4,
//   BotAccount: 4,
// });

// for (let x of players.default) {
//   let data = [];
//   for (let y of x.names) {
//     let uuid = await getUUID(y);
//     data.push({
//       name: y,
//       uuid: uuid,
//     });
//     // Wait for 1 second before the next iteration
//     await delay(1000);
//   }
//   let d = db.get("players");
//   d.push({
//     accounts: data,
//     permissionRank: Permissions[capitalizeFirstLetter(x.permissionRank)],
//   });
//   db.set("players", d);
// }

// async function getUUID(username) {
//   let data =await axios
//     .get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
//     .catch((e) => {
//       // console.log(e)
//       console.log("Error with user " + username);
//     });

//     if (!data) return null;
//     if (data.data.errorMessage) return null;
//     return data.data.id;

// }

// function capitalizeFirstLetter(string) {
//   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
// }

// let message = "From [MVP+] Conutik: Hey how are you: I did this :D"
// let command = message.toString().split(": ").slice(1).join(": "); // !p promo (lets say)
// console.log(command)
// import JSONdb from "simple-json-db";
// import path from "path";
// import { fileURLToPath, pathToFileURL } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// /** @type {JSONdb} */
// const playerNamesDatabase = new JSONdb(
//   path.resolve(__dirname, "./data/playerNames.json")
// );
// utils.setPlayerNameDatabase(playerNamesDatabase);
// // console.log(utils.getPreferredUsername({ name: "Conutik" }));
// utils.setUserRank({
//   name: "Conutik",
//   rank: "[MVP+] Conutik".match(/\[.+]/g)
// })

// let object = [{
//   accounts: [{
//     name: "test",
//     uuid: "test"
//   }]
// }, {
//   accounts: [{
//     name: "test",
//     uuid: "testa"
//   }]
// }, {
//   accounts: [{
//     name: "test2",
//     uuid: "test2"
//   }]
// }]

// let data = object.find((x) => x.accounts.find((y) => y.name === "test2"));
// console.log(data)
// console.log(object.find((x) => x.accounts.find((y) => y.name === "test")))

console.log(/^(https:\/\/hypixel\.net\/threads\/bingo)/.test("https://hypixel.net/threads/bingo-guide-for-october-2024.5776434/#t"))
