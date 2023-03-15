import { randomBytes } from "crypto"
import nock from "nock"
import { v4 as uuidv4 } from "uuid"

import {
  CredentialPayloadBuilder,
  signVerifiableCredential
} from "../../../lib"
import { ValidationError } from "../../../lib/errors"
import {
  attestationToCredentialType,
  buildCreditScoreVerificationOffer,
  buildKycVerificationOffer,
  buildProcessApprovalAttestation,
  buildProcessApprovalPresentationDefinition,
  buildVerificationOffer,
  creditScorePresentationDefinition
} from "../../../lib/sample-data"
import {
  buildCreditScoreVC,
  buildProcessApprovalVC
} from "../../../lib/sample-data/verifiable-credentials"
import { buildIssuer, randomDidKey } from "../../../lib/utils/did-fns"
import { validatePresentationSubmission } from "../../../lib/validators"
import {
  composePresentationSubmission,
  decodePresentationSubmission
} from "../../../lib/verifier"
import {
  AttestationTypes,
  CredentialSchema,
  DecodedPresentationSubmission,
  DidKey,
  EncodedPresentationSubmission,
  Issuer,
  PresentationDefinition,
  VerificationOffer
} from "../../../types"
import {
  creditScoreAttestationFixture,
  revocationListFixture
} from "../../fixtures"

const unrecognizedAttestationSchema: CredentialSchema = {
  id: "https://verite.id/definitions/schemas/0.0.1/UnrecognizedSchema",
  type: "SomeUnknownAttestation"
}

let subjectDidKey: DidKey
let issuerDidKey: DidKey
let verifierDidKey: DidKey
let issuer: Issuer
let presentationDefinition: PresentationDefinition
let decodedSubmission: DecodedPresentationSubmission

async function prepare(attestationType: AttestationTypes): Promise<void> {
  const preparedVC = await buildProcessApprovalVC(
    attestationType,
    issuerDidKey,
    subjectDidKey.subject,
    revocationListFixture
  )

  presentationDefinition =
    buildProcessApprovalPresentationDefinition(attestationType)

  const encodedSubmission = await composePresentationSubmission(
    subjectDidKey,
    presentationDefinition,
    preparedVC
  )

  decodedSubmission = await decodePresentationSubmission(encodedSubmission)
}

beforeEach(() => {
  subjectDidKey = randomDidKey(randomBytes)
  issuerDidKey = randomDidKey(randomBytes)
  verifierDidKey = randomDidKey(randomBytes)
  issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
})

describe("Presentation Submission validator", () => {
  it("validates a KYC Presentation Submission", async () => {
    const clientVC = await buildProcessApprovalVC(
      AttestationTypes.KYCAMLAttestation,
      issuerDidKey,
      subjectDidKey.subject
    )

    const verificationRequest = buildVerificationOffer(
      AttestationTypes.KYCAMLAttestation,
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuerDidKey.subject]
    )

    const submission = await composePresentationSubmission(
      subjectDidKey,
      verificationRequest.body.presentation_definition,
      clientVC
    )

    const decodedSubmission = await decodePresentationSubmission(submission)
    try {
      await validatePresentationSubmission(
        decodedSubmission,
        verificationRequest.body.presentation_definition
      )
    } catch (e) {
      console.log(e)
    }

    await expect(
      validatePresentationSubmission(
        decodedSubmission,
        verificationRequest.body.presentation_definition
      )
    ).resolves.not.toThrowError()
  })

  it("validates a Credit Score Presentation Submission", async () => {
    const clientVC = await buildCreditScoreVC(
      issuerDidKey,
      subjectDidKey.subject,
      700
    )

    const verificationRequest = buildCreditScoreVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did],
      creditScoreAttestationFixture.score
    )

    const submission = await composePresentationSubmission(
      subjectDidKey,
      verificationRequest.body.presentation_definition,
      clientVC
    )
    const decodedSubmission = await decodePresentationSubmission(submission)

    await expect(
      validatePresentationSubmission(
        decodedSubmission,
        verificationRequest.body.presentation_definition
      )
    ).resolves.not.toThrowError()
  })

  it("validates a Hybrid Presentation Submission", async () => {
    const vc1 = await buildProcessApprovalVC(
      AttestationTypes.KYCAMLAttestation,
      issuerDidKey,
      subjectDidKey.subject,
      revocationListFixture
    )
    const vc2 = await buildCreditScoreVC(
      issuerDidKey,
      subjectDidKey.subject,
      700,
      revocationListFixture
    )

    const creds = [vc1, vc2]

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
    const submission = await composePresentationSubmission(
      subjectDidKey,
      verificationRequest.body.presentation_definition,
      creds
    )
    const decodedSubmission = await decodePresentationSubmission(submission)

    await expect(
      validatePresentationSubmission(
        decodedSubmission,
        verificationRequest.body.presentation_definition
      )
    ).resolves.not.toThrow()
  })

  it("rejects if the issuer is not trusted", async () => {
    const clientVC = await buildProcessApprovalVC(
      AttestationTypes.KYCAMLAttestation,
      issuerDidKey,
      subjectDidKey.subject
    )

    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      ["NOT TRUSTED"]
    )

    const submission = await composePresentationSubmission(
      subjectDidKey,
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
    const clientVC = await buildCreditScoreVC(
      issuerDidKey,
      subjectDidKey.subject,
      200
    )
    const minimumCreditScore = 600

    const verificationRequest = buildCreditScoreVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did],
      minimumCreditScore
    )

    const submission = await composePresentationSubmission(
      subjectDidKey,
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
    const clientVC = await buildProcessApprovalVC(
      AttestationTypes.KYCAMLAttestation,
      issuerDidKey,
      subjectDidKey.subject
    )

    // Generate Credit Score Request, even though we have a KYC credential
    const verificationRequest = buildCreditScoreVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did],
      800
    )

    const submission = await composePresentationSubmission(
      subjectDidKey,
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
    const clientVC = await buildProcessApprovalVC(
      AttestationTypes.KYCAMLAttestation,
      issuerDidKey,
      subjectDidKey.subject
    )

    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did]
    )

    const differentHolderThanSubject = randomDidKey(randomBytes)
    const submission = await composePresentationSubmission(
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
    const signer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
    const sampleAttestation = buildProcessApprovalAttestation(
      AttestationTypes.KYCAMLAttestation
    )

    const vc = new CredentialPayloadBuilder()
      .issuer(issuer.did)
      .attestations(subjectDidKey.subject, sampleAttestation)
      .type(attestationToCredentialType(AttestationTypes.KYCAMLAttestation))
      .credentialSchema(unrecognizedAttestationSchema)
      .build()

    const signedVc = await signVerifiableCredential(vc, issuer)

    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuer.did]
    )

    const submission = await composePresentationSubmission(
      subjectDidKey,
      verificationRequest.body.presentation_definition,
      signedVc
    )

    // Change the Schema URL, and return a 404
    nock("https://verite.id").get("/MISSING_SCHEMA").reply(400)

    await expectValidationError(
      submission,
      verificationRequest,
      "Credential did not match constraint: We need to ensure the credential conforms to the expected schema"
    )
  })

  it.each([
    [AttestationTypes.KYCAMLAttestation],
    [AttestationTypes.KYBPAMLAttestation],
    [AttestationTypes.EntityAccInvAttestation],
    [AttestationTypes.IndivAccInvAttestation]
  ])(
    "Validates Process Presentation Submission with type %s",
    async (attestationType: AttestationTypes) => {
      await prepare(attestationType)

      await expect(
        validatePresentationSubmission(
          decodedSubmission,
          presentationDefinition
        )
      ).resolves.not.toThrowError()
    }
  )
})

async function expectValidationError(
  submission: EncodedPresentationSubmission,
  verificationRequest: VerificationOffer,
  message: string
): Promise<void> {
  let error: ValidationError | undefined
  const decodedSubmission = await decodePresentationSubmission(submission)

  try {
    await validatePresentationSubmission(
      decodedSubmission,
      verificationRequest.body.presentation_definition
    )
  } catch (e) {
    error = e as ValidationError
  }

  expect(error).toBeDefined()
  expect(error!.details).toEqual(message)
}
