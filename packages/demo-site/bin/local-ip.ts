import internalIP from "internal-ip"

console.log(`HOSTNAME=${internalIP.v4.sync()}`)

if (process.env.NGROK_HOST) {
  console.log(`NGROK_HOST=${process.env.NGROK_HOST}`)
} else {
  console.log(`NGROK_HOST=http://${internalIP.v4.sync()}:3000`)
}
