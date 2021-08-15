import type { RevocationListCredential } from "@centre/verity"
import { apiHandler } from "../../../lib/api-fns"
import { getRevocationListById } from "../../../lib/database"
import { NotFoundError } from "../../../lib/errors"

export default apiHandler<RevocationListCredential>(async (req, res) => {
  const q = `${process.env.NGROK_HOST}${req.url}`
  const revocationList = await getRevocationListById(q)

  if (!revocationList) {
    throw new NotFoundError()
  }

  res.json(revocationList)
})
