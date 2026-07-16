#!/bin/sh
# I know calling node via shell is stupid but I already have this working now:
node - <<'NODE'
const data = require('minecraft-data')
const candidates = ['1.21.8','1.21.9','1.21.10','1.21.11']
for (const version of candidates) {
  const mc = data(version)
  console.log(version, mc ? { protocol: mc.version.version, minecraftVersion: mc.version.minecraftVersion } : null)
}
NODE
