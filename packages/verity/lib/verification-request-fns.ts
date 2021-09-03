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
    request: {
      id: id as string,
      from: from,
      created_time: now,
      expires_time: expires,
      reply_url: replyUrl,
      reply_to: [replyTo],
      callback_url: callbackUrl,
      challenge: uuidv4()
    },
    presentation_definition: presentationDefinition
  }
}
