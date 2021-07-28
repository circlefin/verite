import {
  createCredentialApplication,
  createVerificationSubmission,
  decodeVerifiablePresentation,
  randomDidKey
} from "@centre/verity"
import { createKycAmlFulfillment } from "lib/issuance/fulfillment"
import { findManifestById } from "lib/issuance/manifest"
import { validateCredentialSubmission } from "lib/issuance/submission"
import { credentialSigner } from "lib/signer"
import {
  processCredentialApplication,
  processVerificationSubmission
} from "lib/validators"
import { kycPresentationDefinition } from "lib/verification/requests"
import { findPresentationDefinitionById } from "lib/verification/submission"
import { userFactory } from "test/factories"
import {
  CredentialResults,
  FieldConstraintEvaluation,
  ValidationCheck
} from "types"

describe("Submission validator", () => {
  it("validates a Verification Submission", async () => {
    const clientDidKey = await randomDidKey()
    const kycManifest = findManifestById("KYCAMLAttestation")
    const user = await userFactory({
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
      credentialSigner(),
      acceptedApplication
    )

    const fulfillmentVP = await decodeVerifiablePresentation(
      fulfillment.presentation
    )
    const clientVC = fulfillmentVP.verifiableCredential[0]
    const submission = await createVerificationSubmission(
      clientDidKey,
      kycPresentationDefinition,
      clientVC
    )

    const presDef = findPresentationDefinitionById(
      "KYCAMLPresentationDefinition"
    )
    const result = await processVerificationSubmission(submission, presDef)
    expect(result.accepted()).toBeTruthy()

    const errors = result.errors()
    expect(errors).toBeNull()

    const results = result.results()
    expect(results).toHaveLength(1)
    const match = results[0]
    expect(match.inputDescriptorId).toEqual("kycaml_input")
    expect(match.results).toHaveLength(1)
    expect(match.results[0].match.path).toEqual("$.issuer.id")
  })

  it("validates a CredentialApplication", async () => {
    const clientDidKey = await randomDidKey()
    const kycManifest = findManifestById("KYCAMLAttestation")
    const application = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )
    const acceptedApplication = await processCredentialApplication(
      application,
      kycManifest
    )

    expect(acceptedApplication.accepted()).toBeTruthy()
  })

  it("checks validation formatting for successful matches", async () => {
    const inputDescriptorConstraintField = {
      path: ["path1", "path2", "path3"],
      purpose: "checks that input is suitable"
    }
    const success = { path: "string1", match: true, value: "test1" }

    const fieldConstraintEvaluation = new FieldConstraintEvaluation(
      inputDescriptorConstraintField,
      success,
      null
    )
    const validationCheck = new ValidationCheck("id1", [
      new CredentialResults(null, [fieldConstraintEvaluation])
    ])
    const match = validationCheck.results()

    expect(match[0].inputDescriptorId).toEqual("id1")
    expect(match[0].results[0].match.path).toEqual("string1")
    expect(match[0].results[0].match.value).toEqual("test1")
  })

  it("checks validation formatting for failed matches", async () => {
    const inputDescriptorConstraintField = {
      path: ["path1", "path2", "path3"],
      purpose: "checks that input is suitable"
    }
    const peArray = [
      { path: "string1", match: false, value: "test1" },
      { path: "string1", match: false, value: "test2" }
    ]

    const fieldConstraintEvaluation = new FieldConstraintEvaluation(
      inputDescriptorConstraintField,
      null,
      peArray
    )

    const validationCheck = new ValidationCheck("id1", [
      new CredentialResults(null, [fieldConstraintEvaluation])
    ])

    const errors = validationCheck.errors()
    expect(errors[0].message).toEqual(
      "Credential failed to meet criteria specified by input descriptor id1"
    )
  })
})
