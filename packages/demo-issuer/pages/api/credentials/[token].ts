import jwt from "jsonwebtoken"
import { NextApiRequest, NextApiResponse } from "next"
import {
  composeFulfillmentFromAttestation,
  validateCredentialApplication,
  Attestation,
  buildIssuer,
  CREDIT_SCORE_MANIFEST_ID,
  KYCAML_MANIFEST_ID,
  buildProcessApprovalAttestation,
  buildSampleCreditScoreAttestation,
  KYCAML_CREDENTIAL_TYPE_NAME,
  decodeCredentialApplication,
  attestationToVCSchema,
  CredentialSchema,
  AttestationTypes,
  manifestIdToAttestationType,
  attestationToCredentialType
} from "verite"

import { ManifestMap } from "../manifests"

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
  const _user = jwt.decode(req.query.token as string).sub

  /**
   * Generate the attestation.
   */
  const manifestId = application.credential_application.manifest_id

  const manifest = ManifestMap[manifestId]
  await validateCredentialApplication(application, manifest)
  let attestation: Attestation
  const attestationType = manifestIdToAttestationType(manifestId)
  const credentialSchema = attestationToVCSchema(attestationType)
  const credentialType = attestationToCredentialType(attestationType)

  if (manifestId === CREDIT_SCORE_MANIFEST_ID) {
    attestation = buildSampleCreditScoreAttestation(90)
  } else {
    try {
      // TOFIX
      attestation = buildProcessApprovalAttestation(attestationType)
    } catch (e) {
      console.error(e)
      res.status(500)
      return
    }
  }

  // Generate the Verifiable Presentation
  const presentation = await composeFulfillmentFromAttestation(
    issuer,
    application.holder,
    manifest,
    attestation,
    credentialType,
    {
      credentialSchema: credentialSchema
    }
  )

  // Response
  res.status(200).send(presentation)
}
