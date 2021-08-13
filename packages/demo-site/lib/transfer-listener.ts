import { Contract, Wallet, getDefaultProvider, BigNumber } from "ethers"
import { prisma } from "./database/prisma"

export const listen = (): void => {
  const provider = getDefaultProvider("http://localhost:8545")

  const abi = [
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ]

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  const contract = new Contract(contractAddress, abi, provider)

  contract.on("Transfer", async (from, to, amount, extra) => {
    // A production environment would have many Transfer events within a single
    // block, but for the sake of example, we will assume there will be at most
    // one Transfer event per block.
    // This assumption holds because by default, Hardhat mines a block with
    // each transaction that it receives, in order and with no delay.
    // https://hardhat.org/hardhat-network/#how-does-it-work

    // Check last processed block
    const lastProcessedBlock = (await prisma.settings.findFirst({
      where: {
        name: "blockNumber"
      }
    })) || { value: 0 }

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

    // Note that a production environment would want to transactionally update
    // its balances, but we do not for simplicity of the example.

    // Debit the sender if they exist
    const sender = await prisma.user.findFirst({
      where: {
        address: from
      }
    })
    if (sender) {
      const balance = BigNumber.from(sender.balance).sub(amount).toString()
      // Perform update
      await prisma.user.update({
        where: {
          id: sender.id
        },
        data: {
          balance
        }
      })
    }

    // Credit the receiver if they exist
    const receiver = await prisma.user.findFirst({
      where: {
        address: to
      }
    })
    if (receiver) {
      const balance = BigNumber.from(receiver.balance).add(amount).toString()
      // Perform update
      await prisma.user.update({
        where: {
          id: receiver.id
        },
        data: {
          balance
        }
      })
    }
  })
}
