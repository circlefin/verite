import { randomBytes } from "crypto"
import jsonpath from "jsonpath"

import { buildAndSignVerifiableCredential } from "../../../lib/issuer/credential-fulfillment"
import {
  buildIssuer,
  decodeVerifiableCredential,
  decodeVerifiablePresentation,
  randomDidKey
} from "../../../lib/utils"
import { kycPresentationDefinition } from "../../../lib/verifier/presentation-definitions"
import { buildPresentationSubmission } from "../../../lib/verifier/presentation-submission"
import { kycAmlAttestationFixture } from "../../fixtures/attestations"

describe("buildPresentationSubmission", () => {
  it("builds a Presentation Submission", async () => {
    // DID of the holder
    const didKey = randomDidKey(randomBytes)

    // DID of the issuer
    const issuerDid = randomDidKey(randomBytes)
    const issuer = buildIssuer(issuerDid.subject, issuerDid.privateKey)

    // Builds a signed Verifiable Credential
    const encodedCredential = await buildAndSignVerifiableCredential(
      issuer,
      didKey,
      kycAmlAttestationFixture
    )
    const credential = await decodeVerifiableCredential(encodedCredential)

    // When building a Presentation Submission, we must reference a
    // `definition_id` that identifies the set of definitions we are
    // satisfying. A `descriptor_map` must also map the input parameters by id
    // with the corresponding JSON path in the submission.
    const presentationDefinition = kycPresentationDefinition()

    // Build Presentation Submission
    const encodedSubmission = await buildPresentationSubmission(
      didKey,
      presentationDefinition,
      credential
    )
    const submission = await decodeVerifiablePresentation(encodedSubmission)

    // In this example, the Presentation Submission is for a Presentation
    // Request requiring a KYC credential.
    expect(submission).toMatchObject({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      presentation_submission: {
        definition_id: presentationDefinition.id,
        descriptor_map: [
          {
            format: "jwt_vc",
            id: "kycaml_input",
            path: "$.verifiableCredential[0]"
          }
        ]
        // "id": "40a2614b-bd9a-4301-b19b-543f8c5f3ba2"
      },
      verifiableCredential: [
        {
          type: ["VerifiableCredential", "KYCAMLAttestation"],
          credentialSubject: {
            id: didKey.subject,
            KYCAMLAttestation: {
              "@type": "KYCAMLAttestation",
              process:
                "https://demos.verite.id/schemas/definitions/1.0.0/kycaml/usa"
              // approvalDate: attestation.approvalDate,
            }
          },
          issuer: { id: issuerDid.subject }
        }
      ]
    })

    // Next, we demonstrate how the descriptor map is used to satisfy the
    // presentation request requirements.

    // Notice that the presentation definition has an input with the
    // id "kycaml_input". The submission will satisfy it with the value at the
    // given path.
    expect(presentationDefinition.input_descriptors[0].id).toEqual(
      "kycaml_input"
    )

    // The submission has a matching identifier
    expect(submission.presentation_submission.descriptor_map[0].id).toEqual(
      "kycaml_input"
    )
    // The submission defines the path to find it
    const path = submission.presentation_submission.descriptor_map[0].path

    // Query the submission with the path
    const query = jsonpath.query(submission, path)

    // It will match the KYC credential that is required
    expect(query[0]).toMatchObject({
      type: ["VerifiableCredential", "KYCAMLAttestation"],
      credentialSubject: {
        id: didKey.subject,
        KYCAMLAttestation: {
          "@type": "KYCAMLAttestation",
          process:
            "https://demos.verite.id/schemas/definitions/1.0.0/kycaml/usa"
          // approvalDate: attestation.approvalDate,
        }
      },
      issuer: { id: issuerDid.subject }
    })
  })
})
