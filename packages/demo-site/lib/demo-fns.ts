import { verificationResult } from "@centre/verity/dist"
import { Contract, Wallet } from "ethers"
import { User } from "./database"
import {
  getProvider,
  verityTokenContractAddress,
  verityTokenContractArtifact
} from "./eth-fns"

export type Transaction = {
  amount: string
  address: string
}

export async function send(
  user: User,
  transaction: Transaction,
  withVerification = true
): Promise<boolean> {
  if (!transaction) {
    return false
  }

  const provider = getProvider()
  const wallet = Wallet.fromMnemonic(user.mnemonic).connect(provider)
  const contract = new Contract(
    verityTokenContractAddress(),
    verityTokenContractArtifact().abi,
    wallet
  )

  // In a production environment, one would need to call out to a verifier to get a result
  const mnemonic =
    "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
  const verification = await verificationResult(
    wallet.address,
    verityTokenContractAddress(),
    mnemonic,
    parseInt(process.env.NEXT_PUBLIC_ETH_NETWORK, 10)
  )

  if (withVerification) {
    // Call out to other service letting them know the results
    const response = await fetch(`${process.env.HOST}/api/demo/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verification })
    })
    console.log(JSON.stringify({ verification }))
    console.log(await response.text())
  } else {
    console.log("Skipping verification")
  }

  // This fails.
  // const tx = await contract.transfer(
  //   transaction.address,
  //   parseInt(transaction.amount, 20)
  // )
  // await tx.wait()

  const tx = await contract.validateAndTransfer(
    transaction.address,
    parseInt(transaction.amount, 10),
    verification.verificationInfo,
    verification.signature
  )
  await tx.wait()

  return true
}
