import {
  createCredentialApplication,
  createPresentationSubmission,
  decodeVerifiablePresentation,
  randomDidKey
} from "@centre/verity"
import { createUser } from "lib/database"
import { createKycAmlFulfillment } from "lib/issuance/fulfillment"
import { findManifestById } from "lib/issuance/manifest"
import { validateCredentialSubmission } from "lib/issuance/submission"
import { credentialSigner } from "lib/signer"
import {
  verifyCredentialApplication,
  verifyVerificationSubmission
} from "lib/validators"
import { kycVerificationRequest } from "lib/verification/requests"
import { findPresentationDefinitionById } from "lib/verification/submission"

describe("VC validator", () => {
  it("validates a Verification Submission", async () => {
    const clientDidKey = await randomDidKey()
    const kycManifest = findManifestById("KYCAMLAttestation")
    const user = await createUser("test@test.com", {
      jumioScore: 55,
      ofacScore: 2
    })
    const application = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )
    const acceptedApplication = await validateCredentialSubmission(application)
    const fulfillment = await createKycAmlFulfillment(
      user,
      credentialSigner,
      acceptedApplication
    )

    const fulfillmentVP = await decodeVerifiablePresentation(
      fulfillment.presentation
    )
    const clientVC = fulfillmentVP.payload.vp.verifiableCredential[0]
    const kycRequest = kycVerificationRequest()
    const submission = await createPresentationSubmission(
      clientDidKey,
      kycRequest.presentation_definition,
      clientVC
    )

    const presDef = findPresentationDefinitionById(
      "KYCAMLPresentationDefinition"
    )
    const errors = []
    const result = await verifyVerificationSubmission(
      submission,
      presDef,
      errors
    )
    expect(errors).toHaveLength(0)
    const matches = result.matches["kycaml_input"]
    expect(matches).toHaveLength(1)
    const theMatch = matches[0].fieldsAndMatches[0].matches[0]
    expect(theMatch.path).toEqual("$.issuer.id")
  })

  it("validates a CredentialApplication", async () => {
    const clientDidKey = await randomDidKey()
    const kycManifest = findManifestById("KYCAMLAttestation")
    const user = await createUser("test@test.com", {
      jumioScore: 55,
      ofacScore: 2
    })
    const application = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )

    const errors = []
    const acceptedApplication = await verifyCredentialApplication(
      application,
      kycManifest,
      errors
    )
    expect(errors).toHaveLength(0)
    const matches = acceptedApplication.matches["proofOfIdentifierControlVP"]
    expect(matches).toHaveLength(1)
  })
})
