import { apiHandler, requireMethod } from "../../../lib/api-fns"
import { currentUser } from "../../../lib/auth-fns"
import { PendingReceive, prisma } from "../../../lib/database/prisma"
import { NotFoundError } from "../../../lib/errors"
import { getBalance } from "../../../lib/eth-fns"

type Response = {
  address: string
  balance: string
  pendingTransaction?: PendingReceive
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

  const pendingTransactions = await prisma.pendingReceive.findMany({
    where: {
      to: user.address
    }
  })

  const balance = await getBalance(user?.address)
  res.json({
    address: user.address,
    balance: balance.toString(),
    pendingTransaction: pendingTransactions[0]
  })
})
