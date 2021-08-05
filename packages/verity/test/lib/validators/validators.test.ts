import { createVerificationSubmission } from "../../../lib/client/verification-submission"
import { createCredentialApplication } from "../../../lib/credential-application-fns"
import {
  buildAndSignKycAmlFulfillment,
  kycAmlAttestation
} from "../../../lib/issuer/fulfillment"
import { decodeVerifiablePresentation } from "../../../lib/utils/credentials"
import { randomDidKey } from "../../../lib/utils/did-fns"
import {
  CredentialResults,
  FieldConstraintEvaluation,
  ValidationCheck
} from "../../../lib/validators/Matches"
import { validateCredentialApplication } from "../../../lib/validators/validateCredentialApplication"
import {
  processCredentialApplication,
  processVerificationSubmission
} from "../../../lib/validators/validators"
import { generateKycVerificationRequest } from "../../../lib/verification-requests"
import { revocationListFixture } from "../../fixtures/revocation-list"
import { generateVerifiableCredential } from "../../fixtures/verifiable-credential"
import { generateManifestAndIssuer } from "../../support/manifest-fns"

describe("Submission validator", () => {
  it("validates a Verification Submission", async () => {
    const clientDidKey = await randomDidKey()
    const verifierDidKey = await randomDidKey()
    const { manifest, issuer } = await generateManifestAndIssuer()
    const application = await createCredentialApplication(
      clientDidKey,
      manifest
    )

    const acceptedApplication = await validateCredentialApplication(
      application,
      manifest
    )

    const fulfillment = await buildAndSignKycAmlFulfillment(
      issuer,
      acceptedApplication,
      revocationListFixture,
      kycAmlAttestation([])
    )

    const fulfillmentVP = await decodeVerifiablePresentation(
      fulfillment.presentation
    )
    const clientVC = fulfillmentVP.verifiableCredential![0]

    const kycRequest = generateKycVerificationRequest(
      verifierDidKey.controller,
      "https://test.host/verify",
      verifierDidKey.controller,
      "https://other.host/callback",
      [issuer.did]
    )

    const submission = await createVerificationSubmission(
      clientDidKey,
      kycRequest.presentation_definition,
      clientVC
    )

    const result = await processVerificationSubmission(
      submission,
      kycRequest.presentation_definition
    )

    expect(result.accepted()).toBe(true)

    const errors = result.errors()
    expect(errors).toEqual([])

    const results = result.results()
    expect(results).toHaveLength(1)
    const match = results[0]
    expect(match.inputDescriptorId).toEqual("kycaml_input")
    expect(match.results).toHaveLength(1)
    expect(match.results[0].match!.path).toEqual("$.issuer.id")
  })

  it("rejects if the issuer is not trusted", async () => {
    const clientDidKey = await randomDidKey()
    const verifierDidKey = await randomDidKey()
    const { manifest, issuer } = await generateManifestAndIssuer()
    const application = await createCredentialApplication(
      clientDidKey,
      manifest
    )

    const acceptedApplication = await validateCredentialApplication(
      application,
      manifest
    )

    const fulfillment = await buildAndSignKycAmlFulfillment(
      issuer,
      acceptedApplication,
      revocationListFixture,
      kycAmlAttestation([])
    )

    const fulfillmentVP = await decodeVerifiablePresentation(
      fulfillment.presentation
    )
    const clientVC = fulfillmentVP.verifiableCredential![0]

    const kycRequest = generateKycVerificationRequest(
      verifierDidKey.controller,
      "https://test.host/verify",
      verifierDidKey.controller,
      "https://other.host/callback",
      ["NOT TRUSTED"]
    )

    const submission = await createVerificationSubmission(
      clientDidKey,
      kycRequest.presentation_definition,
      clientVC
    )

    const result = await processVerificationSubmission(
      submission,
      kycRequest.presentation_definition
    )

    expect(result.accepted()).toBe(false)
    expect(result.errors()[0].details).toEqual(
      "Credential did not match constraint: We can only verify KYC credentials attested by a trusted authority."
    )
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

  it("checks validation formatting for successful matches", async () => {
    const inputDescriptorConstraintField = {
      path: ["path1", "path2", "path3"],
      purpose: "checks that input is suitable"
    }
    const success = { path: "string1", match: true, value: "test1" }
    const vc = await generateVerifiableCredential()

    const fieldConstraintEvaluation = new FieldConstraintEvaluation(
      inputDescriptorConstraintField,
      success
    )

    const validationCheck = new ValidationCheck("id1", [
      new CredentialResults(vc, [fieldConstraintEvaluation])
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
    const vc = await generateVerifiableCredential()

    const fieldConstraintEvaluation = new FieldConstraintEvaluation(
      inputDescriptorConstraintField,
      undefined,
      peArray
    )

    const validationCheck = new ValidationCheck("id1", [
      new CredentialResults(vc, [fieldConstraintEvaluation])
    ])

    const errors = validationCheck.errors()
    expect(errors[0].message).toEqual(
      "Credential failed to meet criteria specified by input descriptor id1"
    )
  })
})
