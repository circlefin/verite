import { currentUser2 } from "@centre/demo-site/lib/auth-fns"
import { ProcessingError } from "@centre/demo-site/lib/errors"
import { verityTokenContractAddress } from "@centre/demo-site/lib/eth-fns"
import { fullURL } from "@centre/demo-site/lib/utils"
import { verificationResult } from "@centre/verity"
import { Wallet } from "ethers"
import jwt from "jsonwebtoken"
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

  // Input
  const transaction = req.body.transaction as Transaction

  if (!transaction) {
    throw new ProcessingError()
  }

  // In a production environment, one would need to call out to a verifier to get a result
  const wallet = Wallet.fromMnemonic(user.mnemonic)
  const mnemonic =
    "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
  const verification = await verificationResult(
    wallet.address,
    verityTokenContractAddress(),
    mnemonic,
    parseInt(process.env.NEXT_PUBLIC_ETH_NETWORK, 10)
  )

  // Create JWT for callback
  const token = jwt.sign(
    { transaction, verification },
    process.env.AUTH_JWT_SECRET,
    {
      subject: user.id,
      algorithm: "HS256",
      expiresIn: "1h"
    }
  )

  const payload = {
    callbackUrl: fullURL(`/api/cefi/callback/${token}`),
    transaction,
    verification
  }

  // Call out to other service letting them know the results
  await fetch(fullURL("/api/cefi/verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  // Success
  res.status(200).json({ status: "ok" })
})
