import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import { prisma } from "../../../../lib/database/prisma"
import { NotFoundError, BadRequestError } from "../../../../lib/errors"

type Response = {
  status: string
}

/**
 * API call for receiver to pickup a pending transaction.
 *
 * This could be fully automated by the receiving counterparty if it so
 * desired, but we display a prompt in the UI for demo purposes.
 */
export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  // Input
  const id = req.query.id as string

  // Lookup pending transaction
  const pendingTransaction = await prisma.pendingTransaction.findUnique({
    where: {
      id
    }
  })

  if (!pendingTransaction) {
    throw new NotFoundError()
  }

  // Extract callback URL
  const json = JSON.parse(pendingTransaction.result)
  const callbackUrl = json.callbackUrl

  // Call the callback URL, which would send the funds
  const response = await fetch(callbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })

  // Delete the verification result so it doesn't show up in the UI anymore.
  // A production system might keep this information.
  await prisma.pendingTransaction.delete({
    where: {
      id
    }
  })

  if (!response.ok) {
    throw new BadRequestError("Unable to send")
  }

  // Success
  res.status(200).json({ status: "ok" })
})
