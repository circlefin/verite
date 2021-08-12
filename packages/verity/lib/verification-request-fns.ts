import { v4 as uuidv4 } from "uuid"
import type { VerificationRequest } from "../types"
import { generatePresentationDefinition } from "./presentation-definitions"

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30

export function generateVerificationRequest(
  type: string,
  from: string,
  replyTo: string,
  replyUrl: string,
  callbackUrl?: string,
  trustedAuthorities: string[] = [],
  opts?: Record<string, unknown>
): VerificationRequest {
  const id = opts?.id || uuidv4()
  const now = Date.now()
  const expires = now + ONE_MONTH

  const presentationDefinition = generatePresentationDefinition(
    type,
    trustedAuthorities,
    opts
  )

  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://identity.foundation/presentation-exchange/definition/v1"
    ],
    type: ["VerifiablePresentation", "PresentationDefinition"],
    request: {
      id: id as string,
      from: from,
      created_time: now,
      expires_time: expires,
      reply_url: replyUrl,
      reply_to: [replyTo],
      callback_url: callbackUrl,
      challenge: "e1b35ae0-9e0e-11ea-9bbf-a387b27c9e61" // TODO: Challenge
    },
    presentation_definition: presentationDefinition
  }
}
