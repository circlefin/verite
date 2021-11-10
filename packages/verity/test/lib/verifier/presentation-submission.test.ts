import { buildAndSignVerifiableCredential } from "../../../lib/issuer/credential-fulfillment"
import {
  buildIssuer,
  decodeVerifiableCredential,
  randomDidKey
} from "../../../lib/utils"
import { kycPresentationDefinition } from "../../../lib/verifier/presentation-definitions"
import { buildPresentationSubmission } from "../../../lib/verifier/presentation-submission"
import { kycAmlAttestationFixture } from "../../fixtures/attestations"
describe("buildPresentationSubmission", () => {
  it("builds a Presentation Submission", async () => {
    // DID of the holder
    const didKey = randomDidKey()

    // DID of the issuer
    const issuerDid = randomDidKey()
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
    const submission = await buildPresentationSubmission(
      didKey,
      presentationDefinition,
      credential
    )

    // In this example, the Presentation Request is for a KYC credential.
    expect(submission).toMatchObject({
      // presentation: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwiaG9sZGVyIjoiZGlkOmtleTp6Nk1raUxRS0FaUHZqRkxrTnNmaUx5U3RoczZhQW9yeWIxY2hQckhHN3VtblI2cDUiLCJ2ZXJpZmlhYmxlQ3JlZGVudGlhbCI6WyJleUpoYkdjaU9pSkZaRVJUUVNJc0luUjVjQ0k2SWtwWFZDSjkuZXlKMll5STZleUpBWTI5dWRHVjRkQ0k2V3lKb2RIUndjem92TDNkM2R5NTNNeTV2Y21jdk1qQXhPQzlqY21Wa1pXNTBhV0ZzY3k5Mk1TSXNJbWgwZEhCek9pOHZkbVZ5YVhSNUxtbGtMMmxrWlc1MGFYUjVJbDBzSW5SNWNHVWlPbHNpVm1WeWFXWnBZV0pzWlVOeVpXUmxiblJwWVd3aUxDSkxXVU5CVFV4QmRIUmxjM1JoZEdsdmJpSmRMQ0pqY21Wa1pXNTBhV0ZzVTNWaWFtVmpkQ0k2ZXlKTFdVTkJUVXhCZEhSbGMzUmhkR2x2YmlJNmV5SkFkSGx3WlNJNklrdFpRMEZOVEVGMGRHVnpkR0YwYVc5dUlpd2lZWFYwYUc5eWFYUjVTV1FpT2lKa2FXUTZkMlZpT25abGNtbDBlUzVwWkNJc0ltRndjSEp2ZG1Gc1JHRjBaU0k2SWpJd01qRXRNVEV0TVRCVU1UazZNRFk2TWpNdU1qUTFXaUlzSW1GMWRHaHZjbWwwZVU1aGJXVWlPaUpXWlhKcGRIa2lMQ0poZFhSb2IzSnBkSGxWY213aU9pSm9kSFJ3Y3pvdkwzWmxjbWwwZVM1cFpDSXNJbUYxZEdodmNtbDBlVU5oYkd4aVlXTnJWWEpzSWpvaWFIUjBjSE02THk5cFpHVnVkR2wwZVM1MlpYSnBkSGt1YVdRaWZYMTlMQ0p6ZFdJaU9pSmthV1E2YTJWNU9ubzJUV3RwVEZGTFFWcFFkbXBHVEd0T2MyWnBUSGxUZEdoek5tRkJiM0o1WWpGamFGQnlTRWMzZFcxdVVqWndOU0lzSW01aVppSTZNVFl6TmpVM01URTRNeXdpYVhOeklqb2laR2xrT210bGVUcDZOazFyYWtOR2NrTjJVRGQ1UkhORWJsRndkVWh1U0VGTmRWbzVWRGxXYzJkMWRsbGpNalpTWjFCWVpGUkZVSEFpZlEuc0xpXzJBOXkwT1M3X2lFMUJkX1VjcXFVa19mZnM5Nk1hR2xBUjh0YVRMa3VHU2NWc0dCa2tlWG1zdmJlMFNyYlhMV3ZZbmNTRGRHV0F5NTFiRWtvQnciXX0sInN1YiI6ImRpZDprZXk6ejZNa2lMUUtBWlB2akZMa05zZmlMeVN0aHM2YUFvcnliMWNoUHJIRzd1bW5SNnA1IiwiaXNzIjoiZGlkOmtleTp6Nk1raUxRS0FaUHZqRkxrTnNmaUx5U3RoczZhQW9yeWIxY2hQckhHN3VtblI2cDUifQ.-8C8D0zjoefRlet1uy-i3o-dRs4S9tmdQrc6n4cxxItwJwjEGhzLog-AI6rFBUyCwpfhplIhiLKO6mQoqakpAQ"
      presentation_submission: {
        definition_id: presentationDefinition.id,
        descriptor_map: [
          {
            format: "jwt_vc",
            id: "kycaml_input",
            path: "$.presentation.verifiableCredential[0]"
          }
        ]
        // "id": "40a2614b-bd9a-4301-b19b-543f8c5f3ba2"
      }
    })

    // Notice that the presentation definition has the id "kycaml_input"
    // and, once decoded, the submission will satisfy it with the value at the
    // given path.
    expect(presentationDefinition.input_descriptors[0].id).toEqual(
      "kycaml_input"
    )
  })
})
