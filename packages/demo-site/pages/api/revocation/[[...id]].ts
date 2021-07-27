import { apiHandler, notFound } from "lib/api-fns"
import { getRevocationListById } from "lib/database"

export default apiHandler<string>(async (req, res) => {
  const q = process.env.REVOCATION_URL
  const revocationList = await getRevocationListById(q)

  if (!revocationList) {
    return notFound(res)
  }

  res.send(revocationList.proof.jwt)
})
