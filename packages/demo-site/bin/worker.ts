import * as dotenv from "dotenv"
import { listen } from "../lib/transfer-listener"

dotenv.config()

async function setup(): Promise<unknown> {
  const promise = new Promise((resolve, reject) => {
    console.log("Starting Transfer event listener...")
    listen()
  })

  return promise
}

setup()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
