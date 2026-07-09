const titles = {
  java: "00000000402b5328",
  nintendo: "00000000441cc96b",
};

const title = process.argv[2] ?? "java";
const clientId = titles[title];

if (!clientId) {
  console.error(`Usage: node scripts/live-device-check.mjs [java|nintendo]`);
  process.exit(1);
}

const deviceResponse = await postLiveDeviceCode({
  client_id: clientId,
  scope: "service::user.auth.xboxlive.com::MBI_SSL",
  response_type: "device_code",
});

if (!deviceResponse.ok) {
  console.error("Failed to request a device code:");
  console.error(JSON.stringify(deviceResponse.body, null, 2));
  process.exit(1);
}

const device = deviceResponse.body;
console.log(`Live auth client: ${title}`);
console.log(
  `To sign in, open ${device.verification_uri} and use the code ${device.user_code}`,
);
console.log(`Direct link: http://microsoft.com/link?otc=${device.user_code}`);
console.log(
  "Waiting for Microsoft to complete or reject the token exchange...",
);

const expiresAt = Date.now() + device.expires_in * 1000 - 100;
while (Date.now() < expiresAt) {
  await sleep(device.interval * 1000);

  const tokenResponse = await postLiveToken(
    {
      client_id: clientId,
      device_code: device.device_code,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    },
    `${clientId}`,
  );

  if (tokenResponse.body?.error === "authorization_pending") continue;

  if (!tokenResponse.ok || tokenResponse.body?.error) {
    console.error("Microsoft rejected the device-code exchange:");
    console.error(
      JSON.stringify(redactTokenFields(tokenResponse.body), null, 2),
    );
    process.exit(1);
  }

  console.log("Microsoft returned an access token for the Xbox Live scope.");
  process.exit(0);
}

console.error("Timed out waiting for Microsoft device-code approval.");
process.exit(1);

async function postLiveDeviceCode(body) {
  return postLive("https://login.live.com/oauth20_connect.srf", body);
}

async function postLiveToken(body, queryClientId) {
  const query = queryClientId ? `?client_id=${queryClientId}` : "";
  return postLive(`https://login.live.com/oauth20_token.srf${query}`, body);
}

async function postLive(url, body) {
  const response = await fetch(url, {
    method: "post",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text };
  }

  return { ok: response.ok, status: response.status, body: parsed };
}

function redactTokenFields(value) {
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      key.toLowerCase().includes("token") ? "[redacted]" : entry,
    ]),
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
