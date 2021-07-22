import { methodNotAllowed, validationError } from "lib/api-fns"
import { validateVerificationSubmission } from "lib/verification/submission"
import { NextApiHandler } from "next"
import { VerificationSubmission } from "verity"

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return methodNotAllowed(res)
  }

  const submission: VerificationSubmission = req.body
  try {
    await validateVerificationSubmission(submission)
  } catch (err) {
    return validationError(res, err)
  }

  res.json({ status: "ok" })
}

export default handler
