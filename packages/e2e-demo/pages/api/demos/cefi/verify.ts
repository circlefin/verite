import { PendingSend } from "@prisma/client"

import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import { prisma } from "../../../../lib/database/prisma"
import { BadRequestError } from "../../../../lib/errors"

type Response = {
  status: string
}

/**
 * Public endpoint that other CeFi providers can call to send funds.
 */
export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  // Input
  const transaction = req.body.transaction as PendingSend
  const callbackUrl = req.body.callbackUrl as string

  if (!transaction || !callbackUrl) {
    throw new BadRequestError("Missing required body fields")
  }

  // In a production environment, now would be a good time to perform
  // verification. In this demo, we include the same information required
  // by the contract, but one could imagine more complex requirements
  // that would then need to be checked.

  // Persist the Verification Result so it can be displayed in the UI
  await prisma.pendingReceive.create({
    data: {
      from: transaction.from,
      to: transaction.to,
      amount: transaction.amount,
      payload: transaction.payload,
      callbackUrl: callbackUrl
    }
  })

  // Success
  res.status(200).json({ status: "ok" })
})
