import path from "path";
import { fileURLToPath } from "url";
import { Authflow } from "prismarine-auth";
import config from "../Config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const defaultAuthOptions = {
  profilesFolder: path.join(repoRoot, ".auth-cache"),
  flow: "sisu",
  authTitle: "00000000402b5328",
  deviceType: "Win32",
};

const username = process.argv[2] ?? config.mineflayerInfo.email;
const { profilesFolder, ...authOptions } = {
  ...defaultAuthOptions,
  ...config.mineflayerInfo.microsoftAuth,
};

console.log(`Checking Microsoft auth for ${username}`);
console.log(`Using cache folder ${profilesFolder}`);
console.log(`Using auth flow ${authOptions.flow}`);

const authflow = new Authflow(username, profilesFolder, authOptions);
const token = await authflow.getMinecraftJavaToken({
  fetchProfile: true,
  fetchCertificates: false,
});

console.log(`Authenticated as ${token.profile.name} (${token.profile.id})`);
