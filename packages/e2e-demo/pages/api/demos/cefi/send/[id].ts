import { apiHandler, requireMethod } from "../../../../../lib/api-fns"
import { prisma } from "../../../../../lib/database/prisma"

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
  requireMethod(req, "DELETE")
  const id = req.query.id as string
  await prisma.pendingSend.delete({
    where: { id }
  })
  res.status(200).json({ status: "ok" })
})
