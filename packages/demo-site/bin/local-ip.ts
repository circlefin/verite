import internalIP from "internal-ip"

console.log(`HOSTNAME=${internalIP.v4.sync()}`)
