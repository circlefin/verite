import { createCredentialApplication } from "../../../lib/client/credential-application"
import { createVerificationSubmission } from "../../../lib/client/verification-submission"
import {
  buildAndSignKycAmlFulfillment,
  kycAmlAttestation
} from "../../../lib/issuer/fulfillment"
import { decodeVerifiablePresentation } from "../../../lib/utils/credentials"
import {
  CredentialResults,
  FieldConstraintEvaluation,
  ValidationCheck
} from "../../../lib/validators/Matches"
import { validateCredentialSubmission } from "../../../lib/validators/validateCredentialSubmission"
import {
  processCredentialApplication,
  processVerificationSubmission
} from "../../../lib/validators/validators"
import { kycPresentationDefinition } from "../../../lib/verification-requests"
import { randomDidKey } from "../../support/did-fns"
import { generateManifestAndIssuer } from "../../support/manifest-fns"
import { sampleRevocationList } from "../../support/revocation-fns"

describe("Submission validator", () => {
  it("validates a Verification Submission", async () => {
    const clientDidKey = await randomDidKey()
    const { manifest, issuer } = await generateManifestAndIssuer()
    const application = await createCredentialApplication(
      clientDidKey,
      manifest
    )

    const acceptedApplication = await validateCredentialSubmission(
      application,
      async () => manifest
    )

    const fulfillment = await buildAndSignKycAmlFulfillment(
      issuer,
      acceptedApplication,
      sampleRevocationList,
      kycAmlAttestation([])
    )

    const fulfillmentVP = await decodeVerifiablePresentation(
      fulfillment.presentation
    )
    const clientVC = fulfillmentVP.verifiableCredential![0]
    const submission = await createVerificationSubmission(
      clientDidKey,
      kycPresentationDefinition,
      clientVC
    )

    const result = await processVerificationSubmission(
      submission,
      kycPresentationDefinition
    )
    console.log(result)
    expect(result.accepted()).toBeTruthy()

    const errors = result.errors()
    expect(errors).toEqual([])

    const results = result.results()
    expect(results).toHaveLength(1)
    const match = results[0]
    expect(match.inputDescriptorId).toEqual("kycaml_input")
    expect(match.results).toHaveLength(1)
    expect(match.results[0].match!.path).toEqual("$.issuer.id")
  })

  it("validates a CredentialApplication", async () => {
    const clientDidKey = await randomDidKey()
    const { manifest } = await generateManifestAndIssuer()
    const application = await createCredentialApplication(
      clientDidKey,
      manifest
    )

    const acceptedApplication = await processCredentialApplication(
      application,
      manifest
    )

    expect(acceptedApplication.accepted()).toBeTruthy()
  })

  /* TODO: CredentialResults can not be given null
  it("checks validation formatting for successful matches", async () => {
    const inputDescriptorConstraintField = {
      path: ["path1", "path2", "path3"],
      purpose: "checks that input is suitable"
    }
    const success = { path: "string1", match: true, value: "test1" }

    const fieldConstraintEvaluation = new FieldConstraintEvaluation(
      inputDescriptorConstraintField,
      success
    )

    const validationCheck = new ValidationCheck("id1", [
      new CredentialResults(null, [fieldConstraintEvaluation])
    ])
    const match = validationCheck.results()

    expect(match[0].inputDescriptorId).toEqual("id1")
    expect(match[0].results[0].match!.path).toEqual("string1")
    expect(match[0].results[0].match!.value).toEqual("test1")
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
  */
})
