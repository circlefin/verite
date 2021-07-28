import {
  EncodedVerificationSubmission,
  VerificationRequest
} from "@centre/verity"
import { NextApiRequest } from "next"
import {
  apiHandler,
  ApiResponse,
  methodNotAllowed,
  notFound,
  validationError
} from "lib/api-fns"
import {
  findVerificationRequest,
  updateVerificationRequestStatus
} from "lib/database/verificationRequests"
import { validateVerificationSubmission } from "lib/verification/submission"

type PostResponse = { status: string }

export default apiHandler<VerificationRequest | PostResponse>(
  async (req, res) => {
    if (req.method === "GET") {
      return get(req, res)
    }

    if (req.method === "POST") {
      return post(req, res)
    }

    return methodNotAllowed(res)
  }
)

/**
 * GET request handler
 *
 * Returns a VerificationRequest based on `id`
 */
async function get(req: NextApiRequest, res: ApiResponse<VerificationRequest>) {
  const verificationRequest = await findVerificationRequest(
    req.query.id as string
  )

  if (!verificationRequest) {
    return notFound(res)
  }

  res.json(verificationRequest)
}

/**
 * POST request handler
 *
 * Accepts and verifies a `VerificationSubmission`, and updates it's status
 */
async function post(req: NextApiRequest, res: ApiResponse<PostResponse>) {
  const submission: EncodedVerificationSubmission = req.body
  const verificationRequest = await findVerificationRequest(
    req.query.id as string
  )

  if (!verificationRequest) {
    return notFound(res)
  }

  try {
    // TODO: Verify submission matches VerificationRequest (e.g. id check?)
    await validateVerificationSubmission(submission)
  } catch (err) {
    await updateVerificationRequestStatus(
      submission.presentation_submission?.id,
      "rejected"
    )
    return validationError(res, err)
  }

  await updateVerificationRequestStatus(
    verificationRequest.request.id,
    "approved"
  )

  res.json({ status: "ok" })
}
