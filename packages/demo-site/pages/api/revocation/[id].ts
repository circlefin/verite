import { NextApiHandler } from "next"
import { notFound } from "lib/api-fns"
import { getRevocationListById } from "lib/database"

const handler: NextApiHandler<any> = async (req, res) => {
  const revocationList = getRevocationListById("foo")

  if (!revocationList) {
    return notFound(res)
  }

  res.json(revocationList)
}

export default handler
