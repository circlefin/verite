import {
  ChallengeTokenUrlWrapper,
  challengeTokenUrlWrapper,
  creditScoreVerificationRequest,
  kycVerificationRequest,
  VerificationRequest
} from "@centre/verity"
import { v4 as uuidv4 } from "uuid"
import { saveVerificationRequest } from "./database/verificationRequests"
import { NotFoundError } from "./errors"
import { fullURL } from "./utils"

const ATTESTATION_TYPE_MAPPINGS = {
  kyc: "KYCAMLAttestation",
  "credit-score": "CreditScoreAttestation"
}

export type VerificationRequestResponse = {
  id: string
  challenge: Record<string, unknown>
  qrCodeData: ChallengeTokenUrlWrapper
}

export async function createVerificationRequest(
  type: string,
  subjectAddress?: string,
  contractAddress?: string
): Promise<VerificationRequestResponse> {
  // If the request includes a subjectAddress and contractAddress query
  // parameter, we will use it to generate an ETH verification result.
  const id = uuidv4()
  const replyUrl = toReplyUrl(id, subjectAddress, contractAddress)

  // Build the verification request for display
  let verificationRequest: VerificationRequest

  if (type === "kyc") {
    verificationRequest = kycVerificationRequest(
      id,
      process.env.VERIFIER_DID,
      replyUrl,
      fullURL(`/api/verification/${id}/callback`),
      [process.env.ISSUER_DID]
    )
  } else if (type === "credit-score") {
    // If the verification request requires a credit score, set the
    // minimum acceptable score.
    verificationRequest = creditScoreVerificationRequest(
      id,
      process.env.VERIFIER_DID,
      replyUrl,
      fullURL(`/api/verification/${id}/callback`),
      [process.env.ISSUER_DID],
      /* minimumCreditScore: */ 600
    )
  } else {
    throw new NotFoundError()
  }

  await saveVerificationRequest(verificationRequest)

  return {
    id,
    challenge: verificationRequest,
    qrCodeData: challengeTokenUrlWrapper(
      fullURL(`/api/verification/${verificationRequest.id}`)
    )
  }
}

function toReplyUrl(
  id: string,
  subjectAddress?: string,
  contractAddress?: string
): string {
  const url = new URL(fullURL(`/api/verification/${id}/submission`))

  if (subjectAddress) {
    url.searchParams.append("subjectAddress", subjectAddress)
  }

  if (contractAddress) {
    url.searchParams.append("contractAddress", contractAddress)
  }

  return url.href
}
