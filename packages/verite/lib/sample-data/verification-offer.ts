import { buildRequestCommon } from "../submission-requests"
import { VERIFICATION_REQUEST_TYPE_NAME } from "../utils/constants"
import {
  creditScorePresentationDefinition,
  kycAmlPresentationDefinition
} from "./presentation-definitions"

import type { VerificationOffer } from "../../types"

export function buildKycVerificationOffer(
  id: string,
  from: string,
  replyUrl: string,
  statusUrl?: string,
  trustedAuthorities: string[] = []
): VerificationOffer {
  const definition = kycAmlPresentationDefinition(trustedAuthorities)
  const request = buildRequestCommon(
    id,
    VERIFICATION_REQUEST_TYPE_NAME,
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
    VERIFICATION_REQUEST_TYPE_NAME,
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
