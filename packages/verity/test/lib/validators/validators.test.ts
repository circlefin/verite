import {
  creditScoreAttestation,
  kycAmlAttestation
} from "../../../lib/attestation"
import { createVerificationSubmission } from "../../../lib/client/verification-submission"
import {
  createCredentialApplication,
  decodeCredentialApplication
} from "../../../lib/credential-application-fns"
import { buildAndSignFulfillment } from "../../../lib/issuer/fulfillment"
import { decodeVerifiablePresentation } from "../../../lib/utils/credentials"
import { randomDidKey } from "../../../lib/utils/did-fns"
import {
  CredentialResults,
  FieldConstraintEvaluation,
  ValidationCheck
} from "../../../lib/validators/Matches"
import { validateCredentialApplication } from "../../../lib/validators/validateCredentialApplication"
import { processVerificationSubmission } from "../../../lib/validators/validators"
import { generateVerificationRequest } from "../../../lib/verification-request-fns"
import { revocationListFixture } from "../../fixtures/revocation-list"
import { generateManifestAndIssuer } from "../../support/manifest-fns"
import { generateVerifiableCredential } from "../../support/verifiable-credential-fns"

describe("Submission validator", () => {
  it("validates a Verification Submission", async () => {
    const clientDidKey = await randomDidKey()
    const verifierDidKey = await randomDidKey()
    const { manifest, issuer } = await generateManifestAndIssuer()
    const application = await createCredentialApplication(
      clientDidKey,
      manifest
    )

    await validateCredentialApplication(application, manifest)

    const decodedApplication = await decodeCredentialApplication(application)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      decodedApplication,
      kycAmlAttestation(),
      { credentialStatus: revocationListFixture }
    )

    const fulfillmentVP = await decodeVerifiablePresentation(
      fulfillment.presentation
    )
    const clientVC = fulfillmentVP.verifiableCredential![0]

    const verificationRequest = generateVerificationRequest(
      "KYCAMLAttestation",
      verifierDidKey.controller,
      verifierDidKey.controller,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did]
    )

    const submission = await createVerificationSubmission(
      clientDidKey,
      verificationRequest.presentation_definition,
      clientVC
    )

    const result = await processVerificationSubmission(
      submission,
      verificationRequest.presentation_definition
    )

    expect(result.accepted()).toBe(true)

    const errors = result.errors()
    expect(errors).toEqual([])

    const results = result.results()
    expect(results).toHaveLength(1)
    const match = results[0]
    expect(match.inputDescriptorId).toEqual("kycaml_input")
    expect(match.results).toHaveLength(3)

    const expectedPaths = [
      "$.issuer.id",
      "$.credentialSubject.KYCAMLAttestation.authorityId",
      "$.credentialSubject.KYCAMLAttestation.approvalDate"
    ]
    expectedPaths.forEach((path) => {
      expect(match.results.some((r) => r.match!.path === path)).toBe(true)
    })
  })

  it("rejects if the issuer is not trusted", async () => {
    const clientDidKey = await randomDidKey()
    const verifierDidKey = await randomDidKey()
    const { manifest, issuer } = await generateManifestAndIssuer()
    const application = await createCredentialApplication(
      clientDidKey,
      manifest
    )

    await validateCredentialApplication(application, manifest)

    const decodedApplication = await decodeCredentialApplication(application)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      decodedApplication,
      kycAmlAttestation(),
      { credentialStatus: revocationListFixture }
    )

    const fulfillmentVP = await decodeVerifiablePresentation(
      fulfillment.presentation
    )
    const clientVC = fulfillmentVP.verifiableCredential![0]

    const verificationRequest = generateVerificationRequest(
      "KYCAMLAttestation",
      verifierDidKey.controller,
      verifierDidKey.controller,
      "https://test.host/verify",
      "https://other.host/callback",
      ["NOT TRUSTED"]
    )

    const submission = await createVerificationSubmission(
      clientDidKey,
      verificationRequest.presentation_definition,
      clientVC
    )

    const result = await processVerificationSubmission(
      submission,
      verificationRequest.presentation_definition
    )

    expect(result.accepted()).toBe(false)
    expect(result.errors()[0].details).toEqual(
      "Credential did not match constraint: We can only verify credentials attested by a trusted authority."
    )
  })

  it("rejects if the credit score is too low", async () => {
    const clientDidKey = await randomDidKey()
    const verifierDidKey = await randomDidKey()
    const { manifest, issuer } = await generateManifestAndIssuer("creditScore")
    const application = await createCredentialApplication(
      clientDidKey,
      manifest
    )

    await validateCredentialApplication(application, manifest)

    const decodedApplication = await decodeCredentialApplication(application)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      decodedApplication,
      creditScoreAttestation(200) // 200 lower than required 400
    )

    const fulfillmentVP = await decodeVerifiablePresentation(
      fulfillment.presentation
    )
    const clientVC = fulfillmentVP.verifiableCredential![0]

    const verificationRequest = generateVerificationRequest(
      "CreditScoreAttestation",
      verifierDidKey.controller,
      verifierDidKey.controller,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did],
      { minimumCreditScore: 400 } // minimum credit score required
    )

    const submission = await createVerificationSubmission(
      clientDidKey,
      verificationRequest.presentation_definition,
      clientVC
    )

    const result = await processVerificationSubmission(
      submission,
      verificationRequest.presentation_definition
    )

    expect(result.accepted()).toBe(false)
    expect(result.errors()[0].details).toEqual(
      "Credential did not match constraint: We can only verify Credit Score credentials that are above 400."
    )
  })

  it("rejects if the submission includes a KYC credential when a Credit Score is required", async () => {
    const clientDidKey = await randomDidKey()
    const verifierDidKey = await randomDidKey()
    const { manifest, issuer } = await generateManifestAndIssuer("kyc")
    const application = await createCredentialApplication(
      clientDidKey,
      manifest
    )

    await validateCredentialApplication(application, manifest)

    const decodedApplication = await decodeCredentialApplication(application)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      decodedApplication,
      kycAmlAttestation(),
      { credentialStatus: revocationListFixture }
    )

    const fulfillmentVP = await decodeVerifiablePresentation(
      fulfillment.presentation
    )
    const clientVC = fulfillmentVP.verifiableCredential![0]

    // Generate Credit Score Request, even though we have a KYC credential
    const verificationRequest = generateVerificationRequest(
      "CreditScoreAttestation",
      verifierDidKey.controller,
      verifierDidKey.controller,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did]
    )

    const submission = await createVerificationSubmission(
      clientDidKey,
      verificationRequest.presentation_definition,
      clientVC
    )

    const result = await processVerificationSubmission(
      submission,
      verificationRequest.presentation_definition
    )

    expect(result.accepted()).toBe(false)
    expect(result.errors()[0].details).toEqual(
      "Credential did not match constraint: The Credit Score Attestation requires the field: 'score'."
    )
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
