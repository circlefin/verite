import { kycAmlAttestation } from "../../../lib/attestation"
import { createVerificationSubmission } from "../../../lib/client/verification-submission"
import {
  createCredentialApplication,
  decodeCredentialApplication
} from "../../../lib/credential-application-fns"
import { ValidationError, ValidationErrorArray } from "../../../lib/errors"
import { buildAndSignFulfillment } from "../../../lib/issuer/fulfillment"
import { decodeVerifiablePresentation } from "../../../lib/utils/credentials"
import { randomDidKey } from "../../../lib/utils/did-fns"
import { validateCredentialApplication } from "../../../lib/validators/validateCredentialApplication"
import { validateVerificationSubmission } from "../../../lib/validators/validateVerificationSubmission"
import { generateKycVerificationRequest } from "../../../lib/verification-requests"
import { decodeVerificationSubmission } from "../../../lib/verification-submission-fns"
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
    const decodedApplication = await decodeCredentialApplication(application)

    validateCredentialApplication(decodedApplication)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      decodedApplication,
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

    const decodedSubmission = await decodeVerificationSubmission(submission)

    await expect(
      validateVerificationSubmission(
        decodedSubmission,
        kycRequest.presentation_definition
      )
    ).resolves.not.toThrowError()
  })

  it("rejects if the issuer is not trusted", async () => {
    const clientDidKey = await randomDidKey()
    const verifierDidKey = await randomDidKey()
    const { manifest, issuer } = await generateManifestAndIssuer()
    const application = await createCredentialApplication(
      clientDidKey,
      manifest
    )
    const decodedApplication = await decodeCredentialApplication(application)
    await validateCredentialApplication(decodedApplication)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      decodedApplication,
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

    const decodedSubmission = await decodeVerificationSubmission(submission)
    await expect(
      validateVerificationSubmission(
        decodedSubmission,
        kycRequest.presentation_definition
      )
    ).rejects.toThrowError(ValidationErrorArray)
  })
})
