import {
  createCredentialApplication,
  createVerificationSubmission,
  decodeVerifiablePresentation,
  randomDidKey,
  validateCredentialSubmission,
  validateVerificationSubmission
} from "@centre/verity"
import { generateRevocationListStatus } from "../..//lib/database"
import { createKycAmlFulfillment } from "../../lib/issuance/fulfillment"
import { findManifestById } from "../../lib/manifest"
import { credentialSigner } from "../../lib/signer"
import { generateKycVerificationRequest } from "../../lib/verification/requests"
import { findPresentationDefinitionById } from "../../lib/verification/submission"
import { userFactory } from "../factories"

describe("verification", () => {
  it("just works", async () => {
    // 0. PREREQ: Ensure client has a valid KYC credential
    const clientDidKey = await randomDidKey()
    const kycManifest = await findManifestById("KYCAMLAttestation")
    const user = await userFactory({
      jumioScore: 55,
      ofacScore: 2
    })
    const application = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )
    const acceptedApplication = await validateCredentialSubmission(
      application,
      findManifestById
    )

    const fulfillment = await createKycAmlFulfillment(
      user,
      credentialSigner(),
      acceptedApplication,
      await generateRevocationListStatus()
    )

    const fulfillmentVP = await decodeVerifiablePresentation(
      fulfillment.presentation
    )
    const clientVC = fulfillmentVP.verifiableCredential[0]

    // 2. VERIFIER: Discovery of verification requirements
    const kycRequest = generateKycVerificationRequest()

    // 3. CLIENT: Create verification submission (wraps a presentation submission)
    const submission = await createVerificationSubmission(
      clientDidKey,
      kycRequest.presentation_definition,
      clientVC
    )

    expect(submission.presentation_submission.descriptor_map).toEqual([
      {
        id: "kycaml_input",
        format: "jwt_vc",
        path: "$.presentation.verifiableCredential[0]"
      }
    ])

    // 4. VERIFIER: Verifies submission
    const result = await validateVerificationSubmission(
      submission,
      findPresentationDefinitionById
    )
    expect(result).toBeDefined()
  })

  it("rejects an expired input", async () => {
    /*
    expect.assertions(1)

    const clientDidKey = await randomDidKey()
    const kycManifest = await findManifestById("KYCAMLAttestation")
    const application = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )

    // overwrite with expired VP
    application.presentation = expiredPresentation

    await expect(
      validateCredentialSubmission(application)
    ).rejects.toThrowError(VerificationError)*/
  })
})
