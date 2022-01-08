import internalIP from "internal-ip"

console.log(`DEMOS_URL=http://${internalIP.v4.sync()}:3000`)
