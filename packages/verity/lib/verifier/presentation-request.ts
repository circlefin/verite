import type { VerificationRequest } from "../../types"
import { buildRequestCommon } from "../submission-requests"
import {
  creditScorePresentationDefinition,
  kycPresentationDefinition
} from "../verifier/presentation-definitions"

export function kycVerificationRequest(
  id: string,
  from: string,
  replyUrl: string,
  statusUrl?: string,
  trustedAuthorities: string[] = []
): VerificationRequest {
  const definition = kycPresentationDefinition(trustedAuthorities)
  const request = buildRequestCommon(
    id,
    "https://verity.id/types/VerificationRequest",
    from,
    replyUrl,
    statusUrl
  )

  return {
    ...request,
    body: {
      ...request.body,
      presentation_definition: definition
    }
  }
}

export function creditScoreVerificationRequest(
  id: string,
  from: string,
  replyUrl: string,
  statusUrl?: string,
  trustedAuthorities: string[] = [],
  minimumCreditScore?: number
): VerificationRequest {
  const definition = creditScorePresentationDefinition(
    trustedAuthorities,
    minimumCreditScore
  )

  const request = buildRequestCommon(
    id,
    "https://verity.id/types/VerificationRequest",
    from,
    replyUrl,
    statusUrl
  )

  return {
    ...request,
    body: {
      ...request.body,
      presentation_definition: definition
    }
  }
}
