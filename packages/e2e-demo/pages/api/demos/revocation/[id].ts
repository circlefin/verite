import type { RevocationListCredential } from "verite"
import { apiHandler } from "../../../../lib/api-fns"
import { getRevocationListById } from "../../../../lib/database"
import { NotFoundError } from "../../../../lib/errors"

export default apiHandler<RevocationListCredential>(async (req, res) => {
  const id = req.query.id as string

  const revocationList = await getRevocationListById(id)

  if (!revocationList) {
    throw new NotFoundError()
  }

  res.json(revocationList)
})
