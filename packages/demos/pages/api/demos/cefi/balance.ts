import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import { currentUser } from "../../../../lib/auth-fns"
import {
  History,
  PendingReceive,
  PendingSend,
  prisma
} from "../../../../lib/database/prisma"
import { NotFoundError } from "../../../../lib/errors"
import { getBalance } from "../../../../lib/eth-fns"

type Response = {
  address: string
  balance: string
  history: History[]
  pendingReceive?: PendingReceive
  pendingSend?: PendingSend
}

/**
 * API call to return information about a user's account
 */
export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "GET")

  const user = await currentUser({ req })
  if (!user) {
    throw new NotFoundError()
  }

  const pendingReceive = await prisma.pendingReceive.findFirst({
    where: {
      to: user.address
    }
  })

  const pendingSend = await prisma.pendingSend.findFirst({
    where: {
      from: user.address
    }
  })

  const history = await prisma.history.findMany({
    where: {
      OR: [
        {
          from: user.address
        },
        {
          to: user.address
        }
      ]
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  const balance = await getBalance(user?.address)
  res.json({
    address: user.address,
    balance: balance.toString(),
    history: history,
    pendingReceive: pendingReceive,
    pendingSend: pendingSend
  })
})
