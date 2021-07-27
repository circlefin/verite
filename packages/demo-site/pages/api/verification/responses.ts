import { EncodedVerificationSubmission } from "@centre/verity"
import { NextApiHandler } from "next"
import { methodNotAllowed, validationError } from "lib/api-fns"
import { validateVerificationSubmission } from "lib/verification/submission"

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return methodNotAllowed(res)
  }

  const submission: EncodedVerificationSubmission = req.body
  try {
    await validateVerificationSubmission(submission)
  } catch (err) {
    return validationError(res, err)
  }

  res.json({ status: "ok" })
}

export default handler
