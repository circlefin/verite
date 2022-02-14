import {
  DidKey,
  buildPresentationSubmission,
  Verifiable,
  W3CCredential,
  VerificationOffer
} from "verite"

type SubmissionResponse = {
  status: string
}

export class VerificationSubmissionError extends Error {
  details?: string

  constructor(message?: string, details?: string) {
    super(message)
    this.name = "VerificationSubmissionError"
    this.details = details
  }
}

async function submitToCallback(url?: string, data?: string): Promise<void> {
  if (!url) {
    return
  }

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
}

export const submitVerification = async (
  didKey: DidKey,
  verificationRequest: VerificationOffer,
  credential: Verifiable<W3CCredential>
): Promise<SubmissionResponse | undefined> => {
  const body = await buildPresentationSubmission(
    didKey,
    verificationRequest.body.presentation_definition,
    credential,
    { challenge: verificationRequest.body.challenge }
  )

  const response = await fetch(verificationRequest.reply_url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body
  })

  if (response.status === 200 || response.status === 201) {
    const json = await response.json()

    submitToCallback(verificationRequest.body.status_url, json)

    return json
  } else if (response.status === 400) {
    const json = await response.json()
    throw new VerificationSubmissionError(
      json.errors[0].message,
      json.errors[0].details
    )
  } else {
    throw new VerificationSubmissionError(
      "Unknown Error",
      await response.text()
    )
  }
}
