import { MaybeRevocableCredential } from "@centre/verity"
import { apiHandler } from "../../../lib/api-fns"
import { findNewestCredential } from "../../../lib/database/credentials"

type Resp = {
  credential: MaybeRevocableCredential
}

/**
 * Load the lastest credentials
 */
export default apiHandler<Resp>(async (req, res) => {
  const createdAt = new Date(req.query.createdAt as string)

  const credential = await findNewestCredential(createdAt)

  if (!credential) {
    res.status(404).json({ status: 404, errors: [] })
    return
  }

  res.json({ credential })
})
