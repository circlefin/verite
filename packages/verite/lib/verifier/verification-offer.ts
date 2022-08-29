import { buildRequestCommon } from "../submission-requests"
import { VERIFICATION_REQUEST } from "../utils"
import {
  creditScorePresentationDefinition,
  kycPresentationDefinition
} from "./presentation-definitions"

import type { VerificationOffer } from "../../types"

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
    VERIFICATION_REQUEST,
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
    VERIFICATION_REQUEST,
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
