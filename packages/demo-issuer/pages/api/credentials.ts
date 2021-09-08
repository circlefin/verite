import {
  buildAndSignFulfillment,
  randomDidKey,
  didKeyToIssuer,
  decodeCredentialApplication,
  KYCAMLAttestation,
  CreditScoreAttestation
} from "@centre/verity"
import { NextApiRequest, NextApiResponse } from "next"

export default async function credentials(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  /**
   * Get signer (issuer)
   *
   * When creating a Verifiable Credential, it is signed with the private key
   * of the issuer. In this example, we generate a random one. However, a
   * production environment would load this from some persistent store.
   */
  const signer = didKeyToIssuer(randomDidKey())

  /**
   * Using Presentation Exchange, the client will submit a credential
   * application. Since we are using JWTs to format the data, we first must
   * decode it.
   */
  const application = await decodeCredentialApplication(req.body)

  /**
   * Generate the attestation. In a production environment, the server would
   * first check that the user meets the requirements.
   */
  const manifestId = application.credential_application.manifest_id
  let attestation: KYCAMLAttestation | CreditScoreAttestation
  if (manifestId === "KYCAMLAttestation") {
    attestation = {
      "@type": "KYCAMLAttestation",
      authorityId: "verity.id",
      approvalDate: new Date().toISOString(),
      authorityName: "verity.id",
      authorityUrl: "https://verity.id",
      authorityCallbackUrl: "https://verity.id"
    }
  } else if (manifestId === "CreditScoreAttestation") {
    attestation = {
      "@type": "CreditScoreAttestation",
      score: 90,
      scoreType: "Credit Score",
      provider: "Experian"
    }
  } else {
    // Unsupported Credential Manifest
    res.status(500)
    return
  }

  // Generate the Verifiable Presentation
  const presentation = await buildAndSignFulfillment(
    signer,
    application,
    attestation
  )

  // Response
  res.status(200).json(presentation)
}
