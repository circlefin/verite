import { RevocableCredential } from "@centre/verity/dist"
import { apiHandler } from "../../../lib/api-fns"
import { findNewestCredential } from "../../../lib/database/credentials"
import { NotFoundError } from "../../../lib/errors"

type Resp = {
  credential: RevocableCredential
}

export default apiHandler<Resp>(async (req, res) => {
  const createdAt = new Date(req.query.createdAt as string)

  const credential = await findNewestCredential(createdAt)

  if (!credential) {
    throw new NotFoundError()
  }

  res.json({ credential })
})
