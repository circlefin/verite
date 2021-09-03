import type { PresentationDefinition } from "./PresentationDefinition"

export type VerificationRequest = {
  request: {
    id: string
    from: string
    created_time: number
    expires_time: number
    reply_url: string
    reply_to: [string]
    callback_url?: string
    challenge?: string
  }
  presentation_definition: PresentationDefinition
}
