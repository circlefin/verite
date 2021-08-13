import { apiHandler, requireMethod } from "@centre/demo-site/lib/api-fns"
import { User } from "@centre/demo-site/lib/database"
import { getSession } from "next-auth/client"

type Response = {
  address: string
  balance: string
}

export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "GET")

  const user = (await getSession({ req })) as User

  console.log(user)

  res.json({ balance: user?.balance, address: user?.address })
})
