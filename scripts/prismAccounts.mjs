import fs from "fs";
import os from "os";
import path from "path";

export function getDefaultPrismAccountsPaths() {
  const paths = [];
  const platform = process.platform;

  if (platform === "darwin") {
    paths.push(
      path.join(
        os.homedir(),
        "Library/Application Support/PrismLauncher/accounts.json",
      ),
    );
  } else if (platform === "win32") {
    if (process.env.APPDATA) {
      paths.push(path.join(process.env.APPDATA, "PrismLauncher/accounts.json"));
    }
  } else {
    if (process.env.XDG_DATA_HOME) {
      paths.push(
        path.join(process.env.XDG_DATA_HOME, "PrismLauncher/accounts.json"),
      );
    }
    paths.push(
      path.join(os.homedir(), ".local/share/PrismLauncher/accounts.json"),
      path.join(
        os.homedir(),
        ".var/app/org.prismlauncher.PrismLauncher/data/PrismLauncher/accounts.json",
      ),
    );
  }

  return paths;
}

export function resolvePrismAccountsFile(configuredPath) {
  const candidates = [configuredPath, ...getDefaultPrismAccountsPaths()].filter(
    Boolean,
  );

  const accountsFile = candidates.find((candidate) => fs.existsSync(candidate));
  if (!accountsFile) {
    throw new Error(
      `Unable to find Prism Launcher accounts.json. Checked: ${candidates.join(", ")}`,
    );
  }

  return accountsFile;
}

export function readPrismAccount({ accountsFile, accountName }) {
  const prismData = JSON.parse(fs.readFileSync(accountsFile, "utf8"));
  const accounts = prismData.accounts ?? [];
  const account =
    accounts.find((entry) => entry.profile?.name === accountName) ??
    accounts.find((entry) => entry.profile?.id === accountName) ??
    accounts.find((entry) => entry.active);

  if (!account?.profile || !account?.ygg?.token) {
    throw new Error(
      `No usable Prism Launcher account found for ${accountName}`,
    );
  }

  const expiresAt = account.ygg.exp ? new Date(account.ygg.exp * 1000) : null;
  if (expiresAt && expiresAt <= new Date()) {
    throw new Error(
      `Prism Launcher token for ${account.profile.name} expired at ${expiresAt.toISOString()}`,
    );
  }

  return { account, expiresAt };
}
