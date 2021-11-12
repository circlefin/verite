import internalIP from "internal-ip"

console.log(`DEMOS_URL=${internalIP.v4.sync()}:3000`)
