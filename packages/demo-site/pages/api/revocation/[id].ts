import { NextApiHandler } from "next"
import { RevocationListCredential } from "../../../../verity/dist"
import { notFound } from "lib/api-fns"
import { getRevocationListById } from "lib/database"

const handler: NextApiHandler<RevocationListCredential> = async (req, res) => {
  const revocationList = getRevocationListById("foo")

  if (!revocationList) {
    return notFound(res)
  }

  res.json(revocationList)
}

export default handler
