import config from "../Config.mjs";
import {
  readPrismAccount,
  resolvePrismAccountsFile,
} from "./prismAccounts.mjs";

const importConfig = config.mineflayerInfo.prismTokenImport ?? {};
const accountsFile = resolvePrismAccountsFile(importConfig.accountsFile);
const accountName =
  process.argv[2] ?? importConfig.accountName ?? config.mineflayerInfo.email;
const { account, expiresAt } = readPrismAccount({ accountsFile, accountName });

console.log(`Accounts file: ${accountsFile}`);
console.log(`Prism account: ${account.profile.name} (${account.profile.id})`);
console.log(`Token expires: ${expiresAt?.toISOString() ?? "unknown"}`);
console.log("Token status: usable");
