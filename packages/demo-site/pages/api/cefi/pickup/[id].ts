import { NotFoundError } from "@centre/demo-site/lib/errors"
import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import { prisma } from "../../../../lib/database/prisma"

type Response = {
  status: string
}

export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  // Input
  const id = req.query.id as string

  const verificationResult = await prisma.pendingTransaction.findUnique({
    where: {
      id
    }
  })

  if (!verificationResult) {
    throw new NotFoundError()
  }

  // Extract callback URL
  const json = JSON.parse(verificationResult.result)
  const callbackUrl = json.callbackUrl

  // Call the callback URL, which should send the funds
  // TODO: Handle error
  await fetch(callbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })

  // Delete the verification result
  await prisma.pendingTransaction.delete({
    where: {
      id
    }
  })

  // Success
  res.status(200).json({ status: "ok" })
})
