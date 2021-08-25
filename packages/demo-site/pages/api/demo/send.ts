import { currentUser2 } from "@centre/demo-site/lib/auth-fns"
import { ProcessingError } from "@centre/demo-site/lib/errors"
import {
  getProvider,
  verityTokenContractAddress,
  verityTokenContractArtifact
} from "@centre/demo-site/lib/eth-fns"
import { verificationResult } from "@centre/verity"
import { ethers, Contract, Wallet } from "ethers"
import { apiHandler, requireMethod } from "../../../lib/api-fns"

type Response = {
  status: string
}

type Transaction = {
  amount: string
  address: string
}

/**
 * Fake centralized API to send VUSDC.
 */
export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  const user = await currentUser2(req)
  console.log(user)

  // Input
  const transaction = req.body.transaction as Transaction
  console.log(transaction)

  if (!transaction) {
    throw new ProcessingError()
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

  // Call out to other service letting them know the results
  const response = await fetch(`${process.env.HOST}/api/demo/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verification })
  })
  console.log(JSON.stringify({ verification }))
  console.log(await response.text())

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
  // await tx.wait()

  // Success
  res.status(200).json({ status: "ok" })
})
