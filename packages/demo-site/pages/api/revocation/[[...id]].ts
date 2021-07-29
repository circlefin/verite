import type { RevocationListCredential } from "@centre/verity"
import { apiHandler, notFound } from "../../../lib/api-fns"
import { getRevocationListById } from "../../../lib/database"

export default apiHandler<RevocationListCredential>(async (req, res) => {
  const q = `${process.env.HOST}${req.url}`
  const revocationList = await getRevocationListById(q)

  if (!revocationList) {
    return notFound(res)
  }

  res.json(revocationList)
})
