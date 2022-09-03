import { randomBytes } from "crypto"
import nock from "nock"
import { v4 as uuidv4 } from "uuid"

import { ValidationError } from "../../../lib/errors"
import { buildCredentialApplication } from "../../../lib/issuer/credential-application"
import {
  buildAndSignFulfillment,
  buildAndSignMultiVcFulfillment,
  buildAndSignVerifiableCredential
} from "../../../lib/issuer/credential-fulfillment"
import { decodeVerifiablePresentation } from "../../../lib/utils/credentials"
import { randomDidKey } from "../../../lib/utils/did-fns"
import { CREDIT_SCORE_ATTESTATION_SCHEMA_VC_OBJ, CREDIT_SCORE_CREDENTIAL_TYPE_NAME, KYCAML_CREDENTIAL_TYPE_NAME, KYC_ATTESTATION_SCHEMA_VC_OBJ } from "../../../lib/utils/sample-data"
import { creditScorePresentationDefinition } from "../../../lib/utils/sample-data/presentation-definitions"
import { buildCreditScoreVerificationOffer, buildKycVerificationOffer } from "../../../lib/utils/sample-data/verification-offer"
import { validateCredentialApplication } from "../../../lib/validators/validate-credential-application"
import { validateVerificationSubmission } from "../../../lib/validators/validate-verification-submission"
import { buildPresentationSubmission } from "../../../lib/verifier/presentation-submission"
import {
  creditScoreAttestationFixture,
  kycAmlAttestationFixture
} from "../../fixtures/attestations"
import { revocationListFixture } from "../../fixtures/revocation-list"
import { generateManifestAndIssuer } from "../../support/manifest-fns"

import type {
  CredentialSchema,
  DecodedCredentialApplication,
  EncodedPresentationSubmission,
  VerificationOffer
} from "../../../types"

const unrecognizedAttestationSchema: CredentialSchema = {
  id: "https://verite.id/definitions/schemas/0.0.1/UnrecognizedSchema",
  type: "SomeUnknownAttestation"
}

describe("Submission validator", () => {
  it("validates a KYC Verification Submission", async () => {
    const clientDidKey = randomDidKey(randomBytes)
    const verifierDidKey = randomDidKey(randomBytes)
    const { manifest, issuer } = await generateManifestAndIssuer()
    const encodedApplication = await buildCredentialApplication(
      clientDidKey,
      manifest
    )
    const application = (await decodeVerifiablePresentation(
      encodedApplication
    )) as DecodedCredentialApplication

    await validateCredentialApplication(application, manifest)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      clientDidKey.subject,
      manifest,
      kycAmlAttestationFixture,
      KYCAML_CREDENTIAL_TYPE_NAME,
      {
        credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ,
        credentialStatus: revocationListFixture
      }
    )

    const fulfillmentVP = await decodeVerifiablePresentation(fulfillment)
    const clientVC = fulfillmentVP.verifiableCredential![0]

    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did]
    )

    const submission = await buildPresentationSubmission(
      clientDidKey,
      verificationRequest.body.presentation_definition,
      clientVC
    )

    await expect(
      validateVerificationSubmission(
        submission,
        verificationRequest.body.presentation_definition
      )
    ).resolves.not.toThrow()
  })

  it("validates a Credit Score Verification Submission", async () => {
    const clientDidKey = randomDidKey(randomBytes)
    const verifierDidKey = randomDidKey(randomBytes)
    const { manifest, issuer } = await generateManifestAndIssuer("creditScore")
    const encodedApplication = await buildCredentialApplication(
      clientDidKey,
      manifest
    )
    const application = (await decodeVerifiablePresentation(
      encodedApplication
    )) as DecodedCredentialApplication

    await validateCredentialApplication(application, manifest)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      clientDidKey.subject,
      manifest,
      creditScoreAttestationFixture,
      CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
      { credentialSchema: CREDIT_SCORE_ATTESTATION_SCHEMA_VC_OBJ }
    )

    const fulfillmentVP = await decodeVerifiablePresentation(fulfillment)
    const clientVC = fulfillmentVP.verifiableCredential![0]

    const verificationRequest = buildCreditScoreVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did],
      creditScoreAttestationFixture.score
    )

    const submission = await buildPresentationSubmission(
      clientDidKey,
      verificationRequest.body.presentation_definition,
      clientVC
    )

    await expect(
      validateVerificationSubmission(
        submission,
        verificationRequest.body.presentation_definition
      )
    ).resolves.not.toThrow()
  })

  it("validates a Hybrid Verification Submission", async () => {
    const clientDidKey = randomDidKey(randomBytes)
    const verifierDidKey = randomDidKey(randomBytes)

    const { manifest, issuer } = await generateManifestAndIssuer("hybrid")
    const encodedApplication = await buildCredentialApplication(
      clientDidKey,
      manifest
    )
    const application = (await decodeVerifiablePresentation(
      encodedApplication
    )) as DecodedCredentialApplication

    await validateCredentialApplication(application, manifest)

    const attestation1 = kycAmlAttestationFixture
    const attestation2 = creditScoreAttestationFixture

    // Builds a signed Verifiable Credential
    const vc1 = await buildAndSignVerifiableCredential(
      issuer,
      clientDidKey,
      attestation1,
      KYCAML_CREDENTIAL_TYPE_NAME,
      // issuanceDate defaults to now, but for testing we will stub it out
      // Note that the did-jwt-vc library will strip out any milliseconds as
      // the JWT exp and iat properties must be in seconds.
      {
        credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ,
        issuanceDate: "2021-10-26T16:17:13.000Z"
      }
    )

    const vc2 = await buildAndSignVerifiableCredential(
      issuer,
      clientDidKey,
      attestation2,
      CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
      // issuanceDate defaults to now, but for testing we will stub it out
      // Note that the did-jwt-vc library will strip out any milliseconds as
      // the JWT exp and iat properties must be in seconds.
      {
        credentialSchema: CREDIT_SCORE_ATTESTATION_SCHEMA_VC_OBJ,
        issuanceDate: "2021-10-26T16:17:13.000Z"
      }
    )

    const creds = [vc1, vc2]

    const encodedFulfillment = await buildAndSignMultiVcFulfillment(
      issuer,
      manifest,
      creds
    )

    const fulfillmentVP = await decodeVerifiablePresentation(encodedFulfillment)
    const clientVC = fulfillmentVP.verifiableCredential!

    // create hybrid pres def
    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did]
    )

    const creditScorePres = creditScorePresentationDefinition()
    verificationRequest.body.presentation_definition.input_descriptors =
      verificationRequest.body.presentation_definition.input_descriptors.concat(
        creditScorePres.input_descriptors
      )
    const submission = await buildPresentationSubmission(
      clientDidKey,
      verificationRequest.body.presentation_definition,
      clientVC
    )

    await expect(
      validateVerificationSubmission(
        submission,
        verificationRequest.body.presentation_definition
      )
    ).resolves.not.toThrow()
  })

  it("rejects if the issuer is not trusted", async () => {
    const clientDidKey = randomDidKey(randomBytes)
    const verifierDidKey = randomDidKey(randomBytes)
    const { manifest, issuer } = await generateManifestAndIssuer()
    const encodedApplication = await buildCredentialApplication(
      clientDidKey,
      manifest
    )
    const application = (await decodeVerifiablePresentation(
      encodedApplication
    )) as DecodedCredentialApplication

    await validateCredentialApplication(application, manifest)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      clientDidKey.subject,
      manifest,
      kycAmlAttestationFixture,
      KYCAML_CREDENTIAL_TYPE_NAME,
      {
        credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ,
        credentialStatus: revocationListFixture
      }
    )

    const fulfillmentVP = await decodeVerifiablePresentation(fulfillment)
    const clientVC = fulfillmentVP.verifiableCredential![0]

    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      ["NOT TRUSTED"]
    )

    const submission = await buildPresentationSubmission(
      clientDidKey,
      verificationRequest.body.presentation_definition,
      clientVC
    )

    await expectValidationError(
      submission,
      verificationRequest,
      "Credential did not match constraint: We can only verify credentials attested by a trusted authority."
    )
  })

  it("rejects if the credit score is too low", async () => {
    const clientDidKey = randomDidKey(randomBytes)
    const verifierDidKey = randomDidKey(randomBytes)
    const { manifest, issuer } = await generateManifestAndIssuer("creditScore")
    const encodedApplication = await buildCredentialApplication(
      clientDidKey,
      manifest
    )
    const application = (await decodeVerifiablePresentation(
      encodedApplication
    )) as DecodedCredentialApplication

    await validateCredentialApplication(application, manifest)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      clientDidKey.subject,
      manifest,
      creditScoreAttestationFixture,
      CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
      { credentialSchema: CREDIT_SCORE_ATTESTATION_SCHEMA_VC_OBJ }
    )

    const minimumCreditScore = creditScoreAttestationFixture.score + 1
    const fulfillmentVP = await decodeVerifiablePresentation(fulfillment)
    const clientVC = fulfillmentVP.verifiableCredential![0]

    const verificationRequest = buildCreditScoreVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did],
      minimumCreditScore
    )

    const submission = await buildPresentationSubmission(
      clientDidKey,
      verificationRequest.body.presentation_definition,
      clientVC
    )

    await expectValidationError(
      submission,
      verificationRequest,
      `Credential did not match constraint: We can only accept credentials where the score value is above ${minimumCreditScore}.`
    )
  })

  it("rejects if the submission includes a KYC credential when a Credit Score is required", async () => {
    const clientDidKey = randomDidKey(randomBytes)
    const verifierDidKey = randomDidKey(randomBytes)
    const { manifest, issuer } = await generateManifestAndIssuer("kyc")
    const encodedApplication = await buildCredentialApplication(
      clientDidKey,
      manifest
    )
    const application = (await decodeVerifiablePresentation(
      encodedApplication
    )) as DecodedCredentialApplication

    await validateCredentialApplication(application, manifest)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      clientDidKey.subject,
      manifest,
      kycAmlAttestationFixture,
      KYCAML_CREDENTIAL_TYPE_NAME,
      {
        credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ,
        credentialStatus: revocationListFixture
      }
    )

    const fulfillmentVP = await decodeVerifiablePresentation(fulfillment)
    const clientVC = fulfillmentVP.verifiableCredential![0]

    // Generate Credit Score Request, even though we have a KYC credential
    const verificationRequest = buildCreditScoreVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did],
      800
    )

    const submission = await buildPresentationSubmission(
      clientDidKey,
      verificationRequest.body.presentation_definition,
      clientVC
    )

    await expectValidationError(
      submission,
      verificationRequest,
      "Credential did not match constraint: We can only accept credentials where the score value is above 800."
    )
  })

  it("rejects if the submission is not signed by the subject", async () => {
    const clientDidKey = randomDidKey(randomBytes)
    const verifierDidKey = randomDidKey(randomBytes)
    const { manifest, issuer } = await generateManifestAndIssuer()
    const encodedApplication = await buildCredentialApplication(
      clientDidKey,
      manifest
    )
    const application = (await decodeVerifiablePresentation(
      encodedApplication
    )) as DecodedCredentialApplication

    await validateCredentialApplication(application, manifest)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      clientDidKey.subject,
      manifest,
      kycAmlAttestationFixture,
      KYCAML_CREDENTIAL_TYPE_NAME,
      {
        credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ,
        credentialStatus: revocationListFixture
      }
    )

    const fulfillmentVP = await decodeVerifiablePresentation(fulfillment)
    const clientVC = fulfillmentVP.verifiableCredential![0]

    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did]
    )

    const differentHolderThanSubject = randomDidKey(randomBytes)
    const submission = await buildPresentationSubmission(
      differentHolderThanSubject,
      verificationRequest.body.presentation_definition,
      clientVC
    )

    await expectValidationError(
      submission,
      verificationRequest,
      "Presentation holder is not the subject."
    )
  })

  it("returns an error if the credential schema doesn't match the expected value", async () => {
    const clientDidKey = randomDidKey(randomBytes)
    const verifierDidKey = randomDidKey(randomBytes)
    const { manifest, issuer } = await generateManifestAndIssuer()
    const encodedApplication = await buildCredentialApplication(
      clientDidKey,
      manifest
    )
    const application = (await decodeVerifiablePresentation(
      encodedApplication
    )) as DecodedCredentialApplication

    await validateCredentialApplication(application, manifest)

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      clientDidKey.subject,
      manifest,
      kycAmlAttestationFixture,
      KYCAML_CREDENTIAL_TYPE_NAME,
      {
        credentialSchema: unrecognizedAttestationSchema,
        credentialStatus: revocationListFixture
      }
    )

    const fulfillmentVP = await decodeVerifiablePresentation(fulfillment)
    const clientVC = fulfillmentVP.verifiableCredential![0]

    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did]
    )

    const submission = await buildPresentationSubmission(
      clientDidKey,
      verificationRequest.body.presentation_definition,
      clientVC
    )

    // Change the Schema URL, and return a 404
    nock("https://verite.id").get("/MISSING_SCHEMA").reply(400)

    await expectValidationError(
      submission,
      verificationRequest,
      "Credential did not match constraint: We need to ensure the credential conforms to the expected schema"
    )
  })
})

async function expectValidationError(
  submission: EncodedPresentationSubmission,
  verificationRequest: VerificationOffer,
  message: string
): Promise<void> {
  let error: ValidationError | undefined

  try {
    await validateVerificationSubmission(
      submission,
      verificationRequest.body.presentation_definition
    )
  } catch (e) {
    error = e as ValidationError
  }

  expect(error).toBeDefined()
  expect(error!.details).toEqual(message)
}
