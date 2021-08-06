import { createVerificationSubmission } from "../../lib/client/verification-submission"
import {
  createCredentialApplication,
  decodeCredentialApplication
} from "../../lib/credential-application-fns"
import { buildAndSignFulfillment } from "../../lib/issuer/fulfillment"
import { decodeVerifiablePresentation } from "../../lib/utils/credentials"
import { randomDidKey } from "../../lib/utils/did-fns"
import { validateCredentialApplication } from "../../lib/validators/validateCredentialApplication"
import { validateVerificationSubmission } from "../../lib/validators/validateVerificationSubmission"
import { generateKycVerificationRequest } from "../../lib/verification-requests"
import { decodeVerificationSubmission } from "../../lib/verification-submission-fns"
import { DidKey, Issuer, RevocableCredential } from "../../types"
import { kycAmlAttestationFixture } from "../fixtures/attestations"
import { revocationListFixture } from "../fixtures/revocation-list"
import { generateManifestAndIssuer } from "../support/manifest-fns"

describe("verification", () => {
  it("accepts and validates a verification submission containing credentials", async () => {
    // 1. Ensure client has Verifiable Credentials
    const verifierDidKey = await randomDidKey()
    const clientDidKey = await randomDidKey()
    const { issuer, credentials } = await getClientVerifiableCredential(
      clientDidKey
    )

    // 2. VERIFIER: Discovery of verification requirements
    const kycRequest = generateKycVerificationRequest(
      verifierDidKey.controller,
      "https://test.host/verify",
      verifierDidKey.controller,
      "https://test.host/callback",
      [issuer.did]
    )

    // 3. CLIENT: Create verification submission (wraps a presentation submission)
    const submission = await createVerificationSubmission(
      clientDidKey,
      kycRequest.presentation_definition,
      credentials
    )

    expect(submission.presentation_submission!.descriptor_map).toEqual([
      {
        id: "kycaml_input",
        format: "jwt_vc",
        path: "$.presentation.verifiableCredential[0]"
      }
    ])

    // 4. VERIFIER: Verifies submission
    const decodedSubmission = await decodeVerificationSubmission(submission)
    await validateVerificationSubmission(
      decodedSubmission,
      kycRequest.presentation_definition
    )
  })
})

async function getClientVerifiableCredential(
  clientDidKey: DidKey
): Promise<{ credentials: RevocableCredential[]; issuer: Issuer }> {
  const { manifest, issuer } = await generateManifestAndIssuer()

  // 0. PREREQ: Ensure client has a valid KYC credential
  const application = await createCredentialApplication(clientDidKey, manifest)
  const decodedApplication = await decodeCredentialApplication(application)
  await validateCredentialApplication(decodedApplication)

  const fulfillment = await buildAndSignFulfillment(
    issuer,
    decodedApplication,
    revocationListFixture,
    kycAmlAttestationFixture
  )

  const fulfillmentVP = await decodeVerifiablePresentation(
    fulfillment.presentation
  )

  return {
    credentials: fulfillmentVP.verifiableCredential as RevocableCredential[],
    issuer: issuer
  }
}
