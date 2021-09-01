import { apiHandler, requireMethod } from "@centre/demo-site/lib/api-fns"
import { currentUser } from "@centre/demo-site/lib/auth-fns"
import { NotFoundError } from "@centre/demo-site/lib/errors"
import { getBalance } from "@centre/demo-site/lib/eth-fns"
import { PendingTransaction, prisma } from "../../../lib/database/prisma"

type Response = {
  address: string
  balance: string
  pendingTransaction?: PendingTransaction
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

  const pendingTransactions = await prisma.pendingTransaction.findMany({
    where: {
      recipientAddress: user.address
    }
  })

  const balance = await getBalance(user?.address)
  res.json({
    address: user.address,
    balance: balance.toString(),
    pendingTransaction: pendingTransactions[0]
  })
})
