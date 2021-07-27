import { EncodedVerificationSubmission } from "@centre/verity"
import { apiHandler, methodNotAllowed, validationError } from "lib/api-fns"
import { validateVerificationSubmission } from "lib/verification/submission"

export default apiHandler(async (req, res) => {
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
})
