import { apiHandler, requireMethod } from "@centre/demo-site/lib/api-fns"
import { User } from "@centre/demo-site/lib/database"
import { getSession } from "next-auth/client"
import { prisma } from "../../../lib/database/prisma"

type Response = {
  address: string
  balance: string
  transfers: any[]
}

export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "GET")

  const user = (await getSession({ req })) as User

  const transfers = await prisma.transfer.findMany({
    where: {
      userId: user.user.id
    }
  })

  res.json({ balance: user?.balance, address: user?.address, transfers })
})
