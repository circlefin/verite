import { apiHandler, notFound } from "lib/api-fns"
import { fetchVerificationRequestStatus } from "lib/database/verificationRequests"

type Resp = {
  status: string
}

export default apiHandler<Resp>(async (req, res) => {
  const status = await fetchVerificationRequestStatus(req.query.id as string)

  if (!status) {
    return notFound(res)
  }

  res.json({ status })
})
