import { AttestationTypes, VerificationOffer } from "../../types"
import { buildRequestCommon } from "../submission-requests"
import { VERIFICATION_REQUEST_TYPE_NAME } from "../utils/constants"
import {
  buildProcessApprovalPresentationDefinition,
  creditScorePresentationDefinition,
  kycAmlPresentationDefinition
} from "./presentation-definitions"

export function buildVerificationOffer(
  attestationType: AttestationTypes,
  id: string,
  from: string,
  replyUrl: string,
  statusUrl?: string,
  trustedAuthorities: string[] = []
) {
  const pd = buildProcessApprovalPresentationDefinition(
    attestationType,
    trustedAuthorities
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
      presentation_definition: pd
    }
  }
}

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
