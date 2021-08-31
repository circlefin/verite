import { Transaction } from "@centre/demo-site/lib/demo-fns"
import { ProcessingError } from "@centre/demo-site/lib/errors"
import { VerificationInfoResponse, verificationResult } from "@centre/verity"
import { apiHandler, requireMethod } from "../../../lib/api-fns"
import { prisma } from "../../../lib/database/prisma"

type Response = {
  status: string
}

export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  // Input
  const verification = req.body.verification as VerificationInfoResponse
  const transaction = req.body.transaction as Transaction
  const callbackUrl = req.body.callbackUrl as string

  if (!verification || !transaction || !callbackUrl) {
    throw new ProcessingError()
  }

  // TODO: Should validate, as if we were the contract.

  // Persist the Verification Result
  await prisma.verificationResult.create({
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
