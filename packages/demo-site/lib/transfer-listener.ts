import { Contract, Wallet, getDefaultProvider } from "ethers"
import { prisma } from "./database/prisma"

export const listen = (): void => {
  const provider = getDefaultProvider("http://localhost:8545")

  const abi = [
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ]

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  const contract = new Contract(contractAddress, abi, provider)

  contract.on("Transfer", async (to, amount, from, extra) => {
    const lastProcessedBlock = await prisma.settings.findFirst({
      where: {
        name: "blockNumber"
      }
    })

    // Current block number
    const blockNumber = extra.blockNumber

    // If we have processed the current block or later, skip
    if (lastProcessedBlock.value >= blockNumber) {
      console.log("Already processed this block, skipping.")
      return
    }

    // Update the latest block
    await prisma.settings.upsert({
      where: {
        name: "blockNumber"
      },
      create: { name: "blockNumber", value: blockNumber },
      update: { name: "blockNumber", value: blockNumber }
    })

    // 1. Find associated user given the to address
    // 2. Credit the user's account if it exists
    // 3. Find associated user given the from address
    // 4. Debit the user's account if it exists
    console.log(to, amount, from, extra)
  })
}
