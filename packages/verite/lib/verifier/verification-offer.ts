import type { VerificationOffer } from "../../types"
import { buildRequestCommon } from "../submission-requests"
import {
  creditScorePresentationDefinition,
  kycPresentationDefinition
} from "./presentation-definitions"

export function buildKycVerificationOffer(
  id: string,
  from: string,
  replyUrl: string,
  statusUrl?: string,
  trustedAuthorities: string[] = []
): VerificationOffer {
  const definition = kycPresentationDefinition(trustedAuthorities)
  const request = buildRequestCommon(
    id,
    "https://verite.id/types/VerificationRequest",
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

export function buildCreditScoreVerificationOffer(
  id: string,
  from: string,
  replyUrl: string,
  statusUrl?: string,
  trustedAuthorities: string[] = [],
  minimumCreditScore?: number
): VerificationOffer {
  const definition = creditScorePresentationDefinition(
    trustedAuthorities,
    minimumCreditScore
  )

  const request = buildRequestCommon(
    id,
    "https://verite.id/types/VerificationRequest",
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
