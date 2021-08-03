import { RevocableCredential } from "@centre/verity/dist"
import { apiHandler, notFound } from "../../../lib/api-fns"
import { findNewestCredential } from "../../../lib/database/credentials"

type Resp = {
  credential: RevocableCredential
}

export default apiHandler<Resp>(async (req, res) => {
  const createdAt = new Date(req.query.createdAt as string)

  const credential = await findNewestCredential(createdAt)

  if (!credential) {
    return notFound(res)
  }

  res.json({ credential })
})
