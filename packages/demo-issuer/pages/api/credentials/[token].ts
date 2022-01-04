import {
  buildAndSignFulfillment,
  decodeCredentialApplication,
  KYCAMLAttestation,
  CreditScoreAttestation,
  buildIssuer
} from "@verity/core"
import { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"

export default async function credentials(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  /**
   * Get signer (issuer)
   *
   * When creating a Verifiable Credential, it is signed with the private key
   * of the issuer. In this demo we load from the environment variable. In a
   * production environment you would want to be sure to keep the secret
   * secure.
   */
  const issuer = buildIssuer(
    process.env.NEXT_PUBLIC_ISSUER_DID,
    process.env.NEXT_PUBLIC_ISSUER_SECRET
  )

  /**
   * Using Presentation Exchange, the client will submit a credential
   * application. Since we are using JWTs to format the data, we first must
   * decode it.
   */
  const application = await decodeCredentialApplication(req.body)

  /**
   * The user id has been passed along with the JWT as the subject. In a
   * production environment, the server would first check that the user meets
   * the requirements. The demo extracts the user id, but for demo purposes
   * we assume the user meets the requirements.
   */
  const user = jwt.decode(req.query.token as string).sub

  /**
   * Generate the attestation.
   */
  const manifestId = application.credential_application.manifest_id
  let attestation: KYCAMLAttestation | CreditScoreAttestation
  if (manifestId === "KYCAMLAttestation") {
    attestation = {
      "@type": "KYCAMLAttestation",
      process: "https://demos.verity.id/schemas/definitions/1.0.0/kycaml/usa",
      approvalDate: new Date().toISOString()
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
    issuer,
    application,
    attestation
  )

  // Response
  res.status(200).json(presentation)
}
