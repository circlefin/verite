import { randomBytes } from "crypto"
import { v4 as uuidv4 } from "uuid"

import { buildKycVerificationOffer } from "../../lib/sample-data"
import { buildProcessApprovalVC } from "../../lib/sample-data/verifiable-credentials"
import { randomDidKey } from "../../lib/utils/did-fns"
import { validatePresentationSubmission } from "../../lib/validators"
import {
  composePresentationSubmission,
  decodePresentationSubmission
} from "../../lib/verifier/presentation-submission"
import { AttestationTypes } from "../../types"
import { revocationListFixture } from "../fixtures"

describe("E2E verification", () => {
  it("accepts and validates a verification submission containing credentials", async () => {
    // 1. Ensure subject has Verifiable Credentials
    const issuerDidKey = randomDidKey(randomBytes)
    const subjectDidKey = randomDidKey(randomBytes)
    const verifierDidKey = randomDidKey(randomBytes)

    const jwtVc = await buildProcessApprovalVC(
      AttestationTypes.KYCAMLAttestation,
      issuerDidKey,
      subjectDidKey.subject,
      revocationListFixture
    )

    // 2. VERIFIER: Enable discovery of verification requirements
    const kycRequest = buildKycVerificationOffer(
      uuidv4(),
      verifierDidKey.subject,
      "https://test.host/verify"
    )

    // 3. CLIENT: Create verification submission (wraps a presentation submission)
    const encodedSubmission = await composePresentationSubmission(
      subjectDidKey,
      kycRequest.body.presentation_definition,
      jwtVc
    )

    // 4. VERIFIER: Decodes and validates submission
    const submission = await decodePresentationSubmission(encodedSubmission)

    expect(submission.presentation_submission!.descriptor_map).toEqual([
      {
        id: "KYCAMLCredential",
        format: "jwt_vc",
        path: "$.verifiableCredential[0]"
      }
    ])

    // ensure validate does not throw
    await expect(
      validatePresentationSubmission(
        submission,
        kycRequest.body.presentation_definition
      )
    ).resolves.not.toThrow()
  })
})
