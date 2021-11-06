import { apiHandler, requireMethod } from "../../../../../lib/api-fns"
import { currentUser } from "../../../../../lib/auth-fns"
import { prisma } from "../../../../../lib/database/prisma"
import { NotFoundError, BadRequestError } from "../../../../../lib/errors"

type Response = {
  status: string
}

/**
 * API call for receiver to pickup or decline a pending transaction.
 *
 * This could be fully automated by the receiving counterparty if it so
 * desired, but we display a prompt in the UI for demo purposes.
 */
export default apiHandler<Response>(async (req, res) => {
  // This method is overloaded to support deleting pending receives
  if (req.method.toLowerCase() === "delete") {
    const id = req.query.id as string
    await prisma.pendingReceive.delete({
      where: { id }
    })
    res.status(200).json({ status: "ok" })
    return
  }

  requireMethod(req, "POST")

  const user = await currentUser({ req })
  if (!user) {
    throw new NotFoundError()
  }

  // Input
  const id = req.query.id as string
  const userAddress = user.address

  // Lookup pending transaction
  const pendingReceive = await prisma.pendingReceive.findFirst({
    where: {
      id,
      to: userAddress
    }
  })

  if (!pendingReceive) {
    throw new NotFoundError()
  }

  // Extract callback URL
  const callbackUrl = pendingReceive.callbackUrl

  // Call the callback URL, which would send the funds
  const response = await fetch(callbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })

  // Delete the verification result so it doesn't show up in the UI anymore.
  // A production system might keep this information.
  await prisma.pendingReceive.delete({
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
