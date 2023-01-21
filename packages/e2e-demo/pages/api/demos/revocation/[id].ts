import { apiHandler } from "../../../../lib/api-fns"
import { getRevocationListById } from "../../../../lib/database"
import { NotFoundError } from "../../../../lib/errors"

import type { EncodedStatusListCredential } from "verite"

export default apiHandler<EncodedStatusListCredential>(async (req, res) => {
  const id = req.query.id as string

  const revocationList = await getRevocationListById(id)

  if (!revocationList) {
    throw new NotFoundError()
  }

  res.send(revocationList)
})
