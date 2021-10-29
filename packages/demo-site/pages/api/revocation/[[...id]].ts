import type { RevocationListCredential } from "@verity/verity"
import { apiHandler } from "../../../lib/api-fns"
import { getRevocationListById } from "../../../lib/database"
import { NotFoundError } from "../../../lib/errors"
import { fullURL } from "../../../lib/utils"

export default apiHandler<RevocationListCredential>(async (req, res) => {
  const q = fullURL(req.url)
  const revocationList = await getRevocationListById(q)

  if (!revocationList) {
    throw new NotFoundError()
  }

  res.json(revocationList)
})
