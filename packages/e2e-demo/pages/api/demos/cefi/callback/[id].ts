import jwt from "jsonwebtoken"

import { apiHandler, requireMethod } from "../../../../../lib/api-fns"
import { findUserByAddress } from "../../../../../lib/database"
import { prisma } from "../../../../../lib/database/prisma"
import { send } from "../../../../../lib/demo-fns"
import { BadRequestError, NotFoundError } from "../../../../../lib/errors"

type Response = {
  status: string
}

/**
 * Callback endpoint to complete a send.
 *
 * The callback URL includes a JWT with information about the transaction,
 * and completed verification result from a trusted verifier. We will use
 * this information to complete the transaction.
 */
export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  // Parse JWT
  const token = req.query.id as string
  const payload = jwt.verify(token, process.env.AUTH_JWT_SECRET)

  // Validate Inputs
  const id = payload.sub as string
  const userAddress = payload["from"] as string
  const transaction = {
    address: payload["to"],
    amount: payload["amount"]
  }

  if (!id || !userAddress || !transaction.address || !transaction.amount) {
    throw new BadRequestError("Missing required body fields")
  }

  // Find user
  const user = await findUserByAddress(userAddress)

  if (!user) {
    throw new NotFoundError()
  }

  // Find and delete pending send so it cannot be replayed or called after
  // being canceled.
  const pendingSend = await prisma.pendingSend.delete({ where: { id } })
  if (!pendingSend) {
    throw new NotFoundError()
  }

  // Send funds
  const success = await send(user, {
    address: pendingSend.to,
    amount: pendingSend.amount
  })

  if (!success) {
    throw new BadRequestError("Unable to send")
  }

  // On success save history of the transaction for UI.
  // This table is shared by both parties, but theoretically they wouldn't
  // be in the same table because they would be on two distinct CeFi services.
  await prisma.history.create({
    data: {
      payload: JSON.stringify(payload),
      from: pendingSend.from,
      to: pendingSend.to,
      amount: pendingSend.amount
    }
  })

  res.json({ status: "ok" })
})
