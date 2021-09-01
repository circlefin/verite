import { VerificationInfoResponse } from "@centre/verity"
import { Contract, Wallet } from "ethers"
import jwt from "jsonwebtoken"
import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import { findUser } from "../../../../lib/database"
import { Transaction } from "../../../../lib/demo-fns"
import { BadRequestError, NotFoundError } from "../../../../lib/errors"
import {
  getProvider,
  verityTokenContractAddress,
  verityTokenContractArtifact
} from "../../../../lib/eth-fns"

type Response = {
  status: string
}

/**
 * Callback endpoint to complete a send.
 *
 * The callback URL includes a JWT with information about the transaction,
 * and completed verification result from a trusted verifier. We will use
 * this information to complete the transaction.
 *
 * In a production environment, one would need to keep track of these
 * transactions so as to prevent replay attacks.
 */
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
    throw new BadRequestError("Missing required body fields")
  }

  // Find user
  const user = await findUser(userId)

  if (!user) {
    throw new NotFoundError()
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
  const receipt = await tx.wait()

  if (receipt.status === 0) {
    throw new BadRequestError("Unable to send")
  }

  res.json({ status: "ok" })
})
