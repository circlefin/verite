import { apiHandler, requireMethod } from "@centre/demo-site/lib/api-fns"
import { findUser } from "@centre/demo-site/lib/database"
import { Transaction } from "@centre/demo-site/lib/demo-fns"
import { ProcessingError } from "@centre/demo-site/lib/errors"
import {
  getProvider,
  verityTokenContractAddress,
  verityTokenContractArtifact
} from "@centre/demo-site/lib/eth-fns"
import { VerificationInfoResponse } from "@centre/verity/dist"
import { Contract, Wallet } from "ethers"
import jwt from "jsonwebtoken"

type Response = {
  status: string
}

export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  // Parse JWT
  const token = req.query.id as string
  const payload = jwt.verify(token, process.env.AUTH_JWT_SECRET)

  // Validate Inputs
  const userId = payload.sub as string
  const transaction = payload["transaction"] as Transaction
  const verification = payload["verification"] as VerificationInfoResponse

  if (!userId || !transaction || !verification) {
    throw new ProcessingError()
  }

  // Find user
  const user = await findUser(userId)

  if (!user) {
    throw new ProcessingError()
  }

  // Setup ETH
  const provider = getProvider()
  const wallet = Wallet.fromMnemonic(user.mnemonic).connect(provider)
  const contract = new Contract(
    verityTokenContractAddress(),
    verityTokenContractArtifact().abi,
    wallet
  )

  // Send funds
  const tx = await contract.validateAndTransfer(
    transaction.address,
    parseInt(transaction.amount, 10),
    verification.verificationInfo,
    verification.signature
  )
  await tx.wait()

  res.json({ status: "ok" })
})
