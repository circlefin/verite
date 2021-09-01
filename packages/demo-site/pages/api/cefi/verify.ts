import { VerificationInfoResponse } from "@centre/verity"
import { apiHandler, requireMethod } from "../../../lib/api-fns"
import { prisma } from "../../../lib/database/prisma"
import { Transaction } from "../../../lib/demo-fns"
import { ProcessingError } from "../../../lib/errors"

type Response = {
  status: string
}

/**
 * Public endpoint that other CeFi providers can call to send funds.
 */
export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  // Input
  const verification = req.body.verification as VerificationInfoResponse
  const transaction = req.body.transaction as Transaction
  const callbackUrl = req.body.callbackUrl as string

  if (!verification || !transaction || !callbackUrl) {
    throw new ProcessingError()
  }

  // In a production environment, now would be a good time to perform
  // verification. In this demo, we include the same information required
  // by the contract, but one could imagine more complex requirements
  // that would then need to be checked.

  // Persist the Verification Result so it can be displayed in the UI
  await prisma.pendingTransaction.create({
    data: {
      result: JSON.stringify(req.body),
      expires: new Date(verification.verificationInfo.expiration * 1000),
      subjectAddress: verification.verificationInfo.subjectAddress,
      recipientAddress: transaction.address
    }
  })

  // Success
  res.status(200).json({ status: "ok" })
})
