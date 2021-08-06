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
import { DidKey, RevocableCredential } from "../../types"
import { kycAmlAttestationFixture } from "../fixtures/attestations"
import { revocationListFixture } from "../fixtures/revocation-list"
import { generateManifestAndIssuer } from "../support/manifest-fns"

describe("verification", () => {
  it("accepts and validates a verification submission containing credentials", async () => {
    // 1. Ensure client has Verifiable Credentials
    const verifierDidKey = await randomDidKey()
    const clientDidKey = await randomDidKey()
    const verifiableCredentials = await getClientVerifiableCredential(
      clientDidKey
    )

    // 2. VERIFIER: Discovery of verification requirements
    const kycRequest = generateKycVerificationRequest(
      verifierDidKey.controller,
      "https://test.host/verify",
      verifierDidKey.controller
    )

    // 3. CLIENT: Create verification submission (wraps a presentation submission)
    const submission = await createVerificationSubmission(
      clientDidKey,
      kycRequest.presentation_definition,
      verifiableCredentials
    )

    expect(submission.presentation_submission!.descriptor_map).toEqual([
      {
        id: "kycaml_input",
        format: "jwt_vc",
        path: "$.presentation.verifiableCredential[0]"
      }
    ])

    // 4. VERIFIER: Verifies submission
    const result = await validateVerificationSubmission(
      submission,
      kycRequest.presentation_definition
    )

    expect(result).toBeDefined()
    expect(result.presentation).toBeDefined()
    expect(result.presentation_submission!.definition_id).toEqual(
      kycRequest.presentation_definition.id
    )
  })
})

async function getClientVerifiableCredential(
  clientDidKey: DidKey
): Promise<RevocableCredential[]> {
  const { manifest, issuer } = await generateManifestAndIssuer()

  // 0. PREREQ: Ensure client has a valid KYC credential
  const application = await createCredentialApplication(clientDidKey, manifest)
  await validateCredentialApplication(application, manifest)

  const decodedApplication = await decodeCredentialApplication(application)

  const fulfillment = await buildAndSignFulfillment(
    issuer,
    decodedApplication,
    revocationListFixture,
    kycAmlAttestationFixture
  )

  const fulfillmentVP = await decodeVerifiablePresentation(
    fulfillment.presentation
  )

  return fulfillmentVP.verifiableCredential as RevocableCredential[]
}
