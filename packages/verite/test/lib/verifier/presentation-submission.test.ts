import { randomBytes } from "crypto"
import jsonpath from "jsonpath"

import { validatePresentationSubmission } from "../../../lib"
import {
  buildProcessApprovalPresentationDefinition,
  ENTITY_ACC_INV_CREDENTIAL_TYPE_NAME,
  INDIV_ACC_INV_CREDENTIAL_TYPE_NAME,
  KYBPAML_CREDENTIAL_TYPE_NAME,
  kycAmlPresentationDefinition,
  KYCAML_CREDENTIAL_TYPE_NAME
} from "../../../lib/sample-data"
import { buildProcessApprovalVC } from "../../../lib/sample-data/verifiable-credentials"
import { randomDidKey } from "../../../lib/utils"
import {
  composePresentationSubmission,
  decodePresentationSubmission
} from "../../../lib/verifier/presentation-submission"
import {
  AttestationTypes,
  DidKey,
  JWT,
  PresentationDefinition
} from "../../../types"
import { revocationListFixture } from "../../fixtures"

let subjectDidKey: DidKey
let issuerDidKey: DidKey
let preparedVC: JWT
let preparedPresentationDefinition: PresentationDefinition

async function prepare(attestationType: AttestationTypes): Promise<void> {
  preparedVC = await buildProcessApprovalVC(
    attestationType,
    issuerDidKey,
    subjectDidKey.subject,
    { credentialStatus: revocationListFixture }
  )

  preparedPresentationDefinition =
    buildProcessApprovalPresentationDefinition(attestationType)
}

beforeEach(() => {
  subjectDidKey = randomDidKey(randomBytes)
  issuerDidKey = randomDidKey(randomBytes)
})
describe("composePresentationSubmission", () => {
  it("composes a KYCAML Presentation Submission", async () => {
    const sample = await buildProcessApprovalVC(
      AttestationTypes.KYCAMLAttestation,
      issuerDidKey,
      subjectDidKey.subject,
      { credentialStatus: revocationListFixture }
    )

    // When building a Presentation Submission, we must reference a
    // `definition_id` that identifies the set of definitions we are
    // satisfying. A `descriptor_map` must also map the input parameters by id
    // with the corresponding JSON path in the submission.
    const presentationDefinition = kycAmlPresentationDefinition()

    // Compose Presentation Submission
    const encodedSubmission = await composePresentationSubmission(
      subjectDidKey,
      presentationDefinition,
      sample
    )

    const submission = await decodePresentationSubmission(encodedSubmission)

    // In this example, the Presentation Submission is for a Presentation
    // Request requiring a KYC credential.
    expect(submission).toMatchObject({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      presentation_submission: {
        definition_id: presentationDefinition.id,
        descriptor_map: [
          {
            format: "jwt_vc",
            id: "KYCAMLCredential",
            path: "$.verifiableCredential[0]"
          }
        ]
        // "id": "40a2614b-bd9a-4301-b19b-543f8c5f3ba2"
      },
      verifiableCredential: [
        {
          type: ["VerifiableCredential", "KYCAMLCredential"],
          credentialSubject: {
            id: subjectDidKey.subject,
            KYCAMLAttestation: {
              type: "KYCAMLAttestation",
              process:
                "https://verite.id/definitions/processes/kycaml/0.0.1/usa"
              // approvalDate: attestation.approvalDate,
            }
          },
          issuer: { id: issuerDidKey.subject }
        }
      ]
    })

    // Next, we demonstrate how the descriptor map is used to satisfy the
    // presentation request requirements.

    // Notice that the presentation definition has an input with the
    // id "KYCAMLCredential". The submission will satisfy it with the value at the
    // given path.
    expect(presentationDefinition.input_descriptors[0].id).toEqual(
      "KYCAMLCredential"
    )

    // The submission has a matching identifier
    expect(submission.presentation_submission?.descriptor_map[0].id).toEqual(
      "KYCAMLCredential"
    )
    // The submission defines the path to find it
    const path = submission.presentation_submission?.descriptor_map[0].path

    // Query the submission with the path
    const query = jsonpath.query(submission, path!)

    // It will match the KYC credential that is required
    expect(query[0]).toMatchObject({
      type: ["VerifiableCredential", "KYCAMLCredential"],
      credentialSubject: {
        id: subjectDidKey.subject,
        KYCAMLAttestation: {
          type: "KYCAMLAttestation",
          process: "https://verite.id/definitions/processes/kycaml/0.0.1/usa"
          // approvalDate: attestation.approvalDate,
        }
      },
      issuer: { id: issuerDidKey.subject }
    })
  })

  it.each([
    [
      AttestationTypes.KYCAMLAttestation,
      KYCAML_CREDENTIAL_TYPE_NAME,
      "https://verite.id/definitions/processes/kycaml/0.0.1/usa"
    ],
    [
      AttestationTypes.KYBPAMLAttestation,
      KYBPAML_CREDENTIAL_TYPE_NAME,
      "https://verite.id/definitions/processes/kybpaml/0.0.1/usa"
    ],
    [
      AttestationTypes.EntityAccInvAttestation,
      ENTITY_ACC_INV_CREDENTIAL_TYPE_NAME,
      "https://verite.id/definitions/processes/kycaml/0.0.1/generic--usa-entity-accinv-all-checks"
    ],
    [
      AttestationTypes.IndivAccInvAttestation,
      INDIV_ACC_INV_CREDENTIAL_TYPE_NAME,
      "https://verite.id/definitions/processes/kycaml/0.0.1/generic--usa-indiv-accinv-all-checks"
    ]
  ])(
    "Composes Presentation Submission with %s expecting VC with type %s and process",
    async (
      attestationType: AttestationTypes,
      expectedCredentialType: string,
      expectedProcess: string
    ) => {
      await prepare(attestationType)

      // Compose Presentation Submission
      const encodedSubmission = await composePresentationSubmission(
        subjectDidKey,
        preparedPresentationDefinition,
        preparedVC
      )

      const submission = await decodePresentationSubmission(encodedSubmission)

      // check descriptor map
      expect(submission.presentation_submission).toBeDefined()
      expect(submission.presentation_submission!.descriptor_map).toHaveLength(1)
      const dm = submission.presentation_submission!.descriptor_map![0]
      expect(dm).toMatchObject({
        format: "jwt_vc",
        id: expectedCredentialType,
        path: "$.verifiableCredential[0]"
      })

      // check verifiable credential
      expect(submission.verifiableCredential).toHaveLength(1)
      const vc = submission.verifiableCredential![0]

      expect(vc.type).toMatchObject([
        "VerifiableCredential",
        expectedCredentialType
      ])
      expect(vc.credentialSubject[attestationType]).toBeDefined()
      expect(vc.credentialSubject[attestationType].type).toEqual(
        attestationType
      )
      expect(vc.credentialSubject[attestationType].process).toEqual(
        expectedProcess
      )

      // ensure validate does not throw
      await expect(
        validatePresentationSubmission(
          submission,
          preparedPresentationDefinition
        )
      ).resolves.not.toThrow()
    }
  )
})
