import { RevocationListCredential } from "../../../../verity/dist"
import { apiHandler, notFound } from "lib/api-fns"
import { getRevocationListById } from "lib/database"

export default apiHandler<RevocationListCredential>(async (req, res) => {
  const revocationList = getRevocationListById("foo")

  if (!revocationList) {
    return notFound(res)
  }

  res.json(revocationList)
})
