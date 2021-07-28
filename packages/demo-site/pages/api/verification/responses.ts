import { EncodedVerificationSubmission } from "@centre/verity"
import { apiHandler, methodNotAllowed, validationError } from "lib/api-fns"
import { validateVerificationSubmission } from "lib/verification/submission"

type ResponseType = {
  status: string
}

export default apiHandler<ResponseType>(async (req, res) => {
  if (req.method !== "POST") {
    return methodNotAllowed(res)
  }

  const submission: EncodedVerificationSubmission = req.body
  try {
    await validateVerificationSubmission(submission)
    // Note: we're making a distinction between malformed input (which gives an error to the caller) vs a
    // submission that's not been accepted. Results of this should be posted to the callback.
    /*
    const processed = await validateVerificationSubmission(submission)
    if (processed.accepted()) {
      const matches = processed.results()
    } else {
      const errors = processed.errors()
    }*/
  } catch (err) {
    return validationError(res, err)
  }

  res.json({ status: "ok" })
})
