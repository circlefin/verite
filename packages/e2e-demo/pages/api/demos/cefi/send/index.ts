import { BigNumber } from "ethers"
import jwt from "jsonwebtoken"

import { apiHandler, requireMethod } from "../../../../../lib/api-fns"
import { currentUser } from "../../../../../lib/auth-fns"
import { prisma } from "../../../../../lib/database/prisma"
import { send } from "../../../../../lib/demo-fns"
import { NotFoundError, BadRequestError } from "../../../../../lib/errors"
import { fullURL } from "../../../../../lib/utils"

type Response = {
  status: string
}

type Transaction = {
  amount: string
  address: string
}

/**
 * Fake centralized API to send VUSDC.
 *
 * This endpoint will immediately send funds if the amount is less than some
 * threshold. For demo purposes it is set to 10 VUSDC.
 *
 * Otherwise, we make an API call to the counterparty with information about
 * the transaction. This information the same as required on the VUSDC token
 * contract. If more information is necessary, e.g. to satisfy travel rule
 * requirements, they could be included.
 *
 * The payload also includes a callback URL that the receiving counterparty
 * can use to complete the transaction.
 */
export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  const user = await currentUser({ req })
  if (!user) {
    throw new NotFoundError()
  }

  // Input
  const transaction = req.body.transaction as Transaction

  if (!transaction) {
    throw new BadRequestError("Missing transaction")
  }

  // If the amount is less than 10, go ahead and send it
  if (BigNumber.from(transaction.amount).lt(10)) {
    const success = await send(user, transaction)
    if (!success) {
      throw new BadRequestError("Failed to send")
    }

    // On success save history of the transaction for UI.
    // This table is shared by both parties, but theoretically they wouldn't
    // be in the same table because they would be on two distinct CeFi services.
    await prisma.history.create({
      data: {
        payload: JSON.stringify({}),
        from: user.address,
        to: transaction.address,
        amount: transaction.amount
      }
    })

    res.status(200).json({ status: "ok" })
    return
  }

  // Create pending send
  const pendingSend = await prisma.pendingSend.create({
    data: {
      from: user.address,
      to: transaction.address,
      amount: transaction.amount,
      payload: JSON.stringify({})
    }
  })

  // Create JWT for callback
  const token = jwt.sign(pendingSend, process.env.AUTH_JWT_SECRET, {
    subject: pendingSend.id,
    algorithm: "HS256",
    expiresIn: "1h"
  })

  // Create API call payload
  const payload = {
    callbackUrl: fullURL(`/api/demos/cefi/callback/${token}`),
    transaction: pendingSend
  }

  // Call out to other service letting them know the results
  await fetch(fullURL("/api/demos/cefi/verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  // Success
  res.status(200).json({ status: "pending" })
})
