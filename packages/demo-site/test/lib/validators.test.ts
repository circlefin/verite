import {
  createCredentialApplication,
  createVerificationSubmission,
  decodeVerifiablePresentation,
  randomDidKey
} from "@centre/verity"
import { createUser } from "lib/database"
import { createKycAmlFulfillment } from "lib/issuance/fulfillment"
import { findManifestById } from "lib/issuance/manifest"
import { validateCredentialSubmission } from "lib/issuance/submission"
import { credentialSigner } from "lib/signer"
import {
  processCredentialApplication,
  processVerificationSubmission
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
    const clientVC = fulfillmentVP.verifiableCredential[0]
    const kycRequest = kycVerificationRequest()
    const submission = await createVerificationSubmission(
      clientDidKey,
      kycRequest.presentation_definition,
      clientVC
    )

    const presDef = findPresentationDefinitionById(
      "KYCAMLPresentationDefinition"
    )
    const result = await processVerificationSubmission(submission, presDef)
    expect(result.accepted()).toBeTruthy()
    const matches = result.validationChecks["kycaml_input"]
    expect(matches).toHaveLength(1)
    // const theMatch = matches[0].fieldMatches[0].matches[0]
    // expect(theMatch.path).toEqual("$.issuer.id")
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
    const acceptedApplication = await processCredentialApplication(
      application,
      kycManifest
    )

    expect(acceptedApplication.accepted()).toBeTruthy()

    const matches =
      acceptedApplication.validationChecks["proofOfIdentifierControlVP"]
    expect(matches).toHaveLength(1)
  })
})
