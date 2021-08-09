import { apiHandler } from "../../../../lib/api-fns"
import { fetchVerificationRequestStatus } from "../../../../lib/database/verificationRequests"
import { NotFoundError } from "../../../../lib/errors"

type Resp = {
  status: string
}

export default apiHandler<Resp>(async (req, res) => {
  const status = await fetchVerificationRequestStatus(req.query.id as string)

  if (!status) {
    throw new NotFoundError()
  }

  res.json({ status })
})
