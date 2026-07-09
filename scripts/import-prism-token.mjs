import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../Config.mjs";
import {
  readPrismAccount,
  resolvePrismAccountsFile,
} from "./prismAccounts.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const importConfig = config.mineflayerInfo.prismTokenImport ?? {};
const microsoftAuthConfig = config.mineflayerInfo.microsoftAuth ?? {};

const accountName =
  args.profile ?? importConfig.accountName ?? config.mineflayerInfo.email;
const cacheUsername =
  args.cacheUsername ??
  importConfig.cacheUsername ??
  config.mineflayerInfo.email;
const accountsFile = resolvePrismAccountsFile(
  args.accountsFile ?? importConfig.accountsFile,
);
const cacheDir =
  args.cacheDir ??
  microsoftAuthConfig.profilesFolder ??
  path.join(repoRoot, ".auth-cache");

const { account, expiresAt } = readPrismAccount({ accountsFile, accountName });
const obtainedOn = Date.now();
const expiresIn = Math.max(
  0,
  Math.floor((account.ygg.exp * 1000 - obtainedOn) / 1000),
);

if (!expiresIn) {
  throw new Error(
    `Prism Launcher token for ${account.profile.name} is expired`,
  );
}

fs.mkdirSync(cacheDir, { recursive: true });

const cacheFile = path.join(
  cacheDir,
  `${createPrismarineUsernameHash(cacheUsername)}_mca-cache.json`,
);
fs.writeFileSync(
  cacheFile,
  `${JSON.stringify(
    {
      mca: {
        access_token: account.ygg.token,
        expires_in: expiresIn,
        token_type: "Bearer",
        obtainedOn,
      },
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Imported Prism token for ${account.profile.name} (${account.profile.id})`,
);
console.log(`Cache username: ${cacheUsername}`);
console.log(`Cache file: ${cacheFile}`);
console.log(`Token expires: ${expiresAt?.toISOString() ?? "unknown"}`);

function createPrismarineUsernameHash(input) {
  return crypto
    .createHash("sha1")
    .update(input ?? "", "binary")
    .digest("hex")
    .slice(0, 6);
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--profile") {
      parsed.profile = next;
      index += 1;
    } else if (arg === "--cache-username") {
      parsed.cacheUsername = next;
      index += 1;
    } else if (arg === "--accounts-file") {
      parsed.accountsFile = next;
      index += 1;
    } else if (arg === "--cache-dir") {
      parsed.cacheDir = next;
      index += 1;
    } else if (!parsed.profile) {
      parsed.profile = arg;
    } else if (!parsed.cacheUsername) {
      parsed.cacheUsername = arg;
    }
  }

  return parsed;
}
