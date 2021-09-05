import {
  ChallengeTokenUrlWrapper,
  challengeTokenUrlWrapper,
  generateVerificationRequest,
  verificationRequestWrapper
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
  if (type !== "kyc" && type !== "credit-score") {
    throw new NotFoundError()
  }

  // If the request includes a subjectAddress and contractAddress query
  // parameter, we will use it to generate an ETH verification result.
  const id = uuidv4()
  const replyUrl = toReplyUrl(id, subjectAddress, contractAddress)

  const requestOpts: Record<string, unknown> = {
    id
  }

  // If the verification request requires a credit score, set the
  // minimum acceptable score.
  if (type === "credit-score") {
    requestOpts.minimumCreditScore = 600
  }

  // Build the verification request for display
  const verificationRequest = generateVerificationRequest(
    ATTESTATION_TYPE_MAPPINGS[type],
    process.env.VERIFIER_DID,
    replyUrl,
    fullURL(`/api/verification/${id}/callback`),
    [process.env.ISSUER_DID],
    requestOpts
  )
  await saveVerificationRequest(verificationRequest)
  return {
    id,
    challenge: verificationRequestWrapper(verificationRequest),
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
