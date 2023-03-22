import { randomBytes } from "crypto"
import nock from "nock"
import { v4 as uuidv4 } from "uuid"

import {
  CredentialPayloadBuilder,
  signVerifiableCredentialJWT
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
import { buildSignerFromDidKey, randomDidKey } from "../../../lib/utils/did-fns"
import { validatePresentationSubmission } from "../../../lib/validators"
import {
  composePresentationSubmission,
  decodePresentationSubmission
} from "../../../lib/verifier"
import {
  AttestationTypes,
  CredentialSchema,
  DecodedPresentationSubmission,
  Signer,
  EncodedPresentationSubmission,
  PresentationDefinition,
  VerificationOffer,
  DidKey
} from "../../../types"
import {
  creditScoreAttestationFixture,
  revocationListFixture
} from "../../fixtures"

const unrecognizedAttestationSchema: CredentialSchema = {
  id: "https://verite.id/definitions/schemas/0.0.1/UnrecognizedSchema",
  type: "SomeUnknownAttestation"
}

let subjectDid: string
let issuerDid: string
let verifierDidKey: DidKey
let subjectSigner: Signer
let issuerSigner: Signer
let presentationDefinition: PresentationDefinition
let decodedSubmission: DecodedPresentationSubmission

async function prepare(attestationType: AttestationTypes): Promise<void> {
  const preparedVC = await buildProcessApprovalVC(
    attestationType,
    issuerSigner,
    subjectDid,
    revocationListFixture
  )

  presentationDefinition =
    buildProcessApprovalPresentationDefinition(attestationType)

  const encodedSubmission = await composePresentationSubmission(
    subjectSigner,
    presentationDefinition,
    preparedVC
  )

  decodedSubmission = await decodePresentationSubmission(encodedSubmission)
}

beforeEach(() => {
  const subjectDidKey = randomDidKey(randomBytes)
  const issuerDidKey = randomDidKey(randomBytes)
  verifierDidKey = randomDidKey(randomBytes)
  issuerSigner = buildSignerFromDidKey(issuerDidKey)
  subjectSigner = buildSignerFromDidKey(subjectDidKey)

  subjectDid = subjectSigner.did
  issuerDid = issuerSigner.did
})

describe("Presentation Submission validator", () => {
  it("validates a KYC Presentation Submission", async () => {
    const clientVC = await buildProcessApprovalVC(
      AttestationTypes.KYCAMLAttestation,
      issuerSigner,
      subjectDid
    )

    const verificationRequest = buildVerificationOffer(
      AttestationTypes.KYCAMLAttestation,
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuerDid]
    )

    const submission = await composePresentationSubmission(
      subjectSigner,
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

  it("validates a Credit Score Presentation Submission", async () => {
    const clientVC = await buildCreditScoreVC(issuerSigner, subjectDid, 700)

    const verificationRequest = buildCreditScoreVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuerDid],
      creditScoreAttestationFixture.score
    )

    const submission = await composePresentationSubmission(
      subjectSigner,
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
      issuerSigner,
      subjectDid,
      revocationListFixture
    )
    const vc2 = await buildCreditScoreVC(
      issuerSigner,
      subjectDid,
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
      [issuerDid]
    )

    const creditScorePres = creditScorePresentationDefinition()
    verificationRequest.body.presentation_definition.input_descriptors =
      verificationRequest.body.presentation_definition.input_descriptors.concat(
        creditScorePres.input_descriptors
      )
    const submission = await composePresentationSubmission(
      subjectSigner,
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
      issuerSigner,
      subjectDid
    )

    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      ["NOT TRUSTED"]
    )

    const submission = await composePresentationSubmission(
      subjectSigner,
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
    const clientVC = await buildCreditScoreVC(issuerSigner, subjectDid, 200)
    const minimumCreditScore = 600

    const verificationRequest = buildCreditScoreVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuerDid],
      minimumCreditScore
    )

    const submission = await composePresentationSubmission(
      subjectSigner,
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
      issuerSigner,
      subjectDid
    )

    // Generate Credit Score Request, even though we have a KYC credential
    const verificationRequest = buildCreditScoreVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuerDid],
      800
    )

    const submission = await composePresentationSubmission(
      subjectSigner,
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
      issuerSigner,
      subjectDid
    )

    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuerDid]
    )

    const differentHolderThanSubject = randomDidKey(randomBytes)
    const differentHolderSigner = buildSignerFromDidKey(
      differentHolderThanSubject
    )
    const submission = await composePresentationSubmission(
      differentHolderSigner,
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
    const sampleAttestation = buildProcessApprovalAttestation(
      AttestationTypes.KYCAMLAttestation
    )

    const vc = new CredentialPayloadBuilder()
      .issuer(issuerSigner.did)
      .attestations(subjectDid, sampleAttestation)
      .type(attestationToCredentialType(AttestationTypes.KYCAMLAttestation))
      .credentialSchema(unrecognizedAttestationSchema)
      .build()

    const signedVc = await signVerifiableCredentialJWT(vc, issuerSigner)

    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify",
      "https://other.host/callback",
      [issuerDid]
    )

    const submission = await composePresentationSubmission(
      subjectSigner,
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
