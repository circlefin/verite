import { apiHandler, requireMethod } from "@centre/demo-site/lib/api-fns"
import { User } from "@centre/demo-site/lib/database"
import { getBalance } from "@centre/demo-site/lib/eth-fns"
import { getSession } from "next-auth/client"
import { prisma } from "../../../lib/database/prisma"

type Response = {
  address: string
  balance: string
  transfers: any[]
  pendingTransactions: any[]
}

export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "GET")

  const user = (await getSession({ req })) as User

  const transfers = await prisma.transfer.findMany({
    where: {
      userId: user?.user?.id
    }
  })

  const pendingTransactions = await prisma.pendingTransaction.findMany({
    where: {
      recipientAddress: user.address
    }
  })

  const balance = await getBalance(user?.address)
  res.json({
    address: user?.address,
    balance: balance.toString(),
    transfers,
    pendingTransaction: pendingTransactions[0]
  })
})
