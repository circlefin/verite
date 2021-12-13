import {
  ChallengeTokenUrlWrapper,
  challengeTokenUrlWrapper,
  buildCreditScoreVerificationOffer,
  buildKycVerificationOffer,
  VerificationOffer
} from "@verity/core"
import { v4 as uuidv4 } from "uuid"
import { saveVerificationOffer } from "./database/verificationRequests"
import { NotFoundError } from "./errors"
import { fullURL } from "./utils"

export type VerificationRequestResponse = {
  id: string
  challenge: Record<string, unknown>
  qrCodeData: ChallengeTokenUrlWrapper
}

export async function createVerificationOffer(
  type: string,
  subjectAddress?: string,
  contractAddress?: string,
  verifierSubmit?: boolean
): Promise<VerificationRequestResponse> {
  // If the request includes a subjectAddress and contractAddress query
  // parameter, we will use it to generate an ETH verification result.
  const id = uuidv4()
  const replyUrl = toReplyUrl(
    id,
    subjectAddress,
    contractAddress,
    verifierSubmit
  )

  // Build the verification request for display
  let verificationRequest: VerificationOffer

  if (type === "kyc") {
    verificationRequest = buildKycVerificationOffer(
      id,
      process.env.VERIFIER_DID,
      replyUrl,
      fullURL(`/api/demos/verifier/${id}/callback`),
      [process.env.ISSUER_DID]
    )
  } else if (type === "credit-score") {
    // If the verification request requires a credit score, set the
    // minimum acceptable score.
    verificationRequest = buildCreditScoreVerificationOffer(
      id,
      process.env.VERIFIER_DID,
      replyUrl,
      fullURL(`/api/demos/verifier/${id}/callback`),
      [process.env.ISSUER_DID],
      /* minimumCreditScore: */ 600
    )
  } else {
    throw new NotFoundError()
  }

  await saveVerificationOffer(verificationRequest)

  return {
    id,
    challenge: verificationRequest,
    qrCodeData: challengeTokenUrlWrapper(
      fullURL(`/api/demos/verifier/${verificationRequest.id}`)
    )
  }
}

function toReplyUrl(
  id: string,
  subjectAddress?: string,
  contractAddress?: string,
  verifierSubmit?: boolean
): string {
  const url = new URL(fullURL(`/api/demos/verifier/${id}/submission`))

  if (subjectAddress) {
    url.searchParams.append("subjectAddress", subjectAddress)
  }

  if (contractAddress) {
    url.searchParams.append("contractAddress", contractAddress)
  }

  if (verifierSubmit) {
    url.searchParams.append("verifierSubmit", "true")
  }

  return url.href
}
