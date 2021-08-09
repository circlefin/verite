import {
  buildIssuer,
  buildAndSignFulfillment,
  createCredentialApplication,
  createVerificationSubmission,
  decodeVerifiablePresentation,
  generateKycVerificationRequest,
  randomDidKey,
  validateCredentialApplication,
  decodeCredentialApplication
} from "@centre/verity"
import type { DidKey } from "@centre/verity"
import { createMocks } from "node-mocks-http"
import {
  fetchVerificationRequestStatus,
  generateRevocationListStatus,
  saveVerificationRequest
} from "../../../../../lib/database"
import { fulfillmentDataForUser } from "../../../../../lib/issuance/fulfillment"
import { findManifestById } from "../../../../../lib/manifest"
import handler from "../../../../../pages/api/verification/[id]/submission"
import { userFactory } from "../../../../../test/factories"

describe("POST /verification/[id]/submission", () => {
  it("validates the submission and updates the verification status", async () => {
    const verificationRequest = generateKycVerificationRequest(
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/submission`,
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/callback`
    )
    await saveVerificationRequest(verificationRequest)
    const clientDidKey = await randomDidKey()
    const clientVC = await generateVc(clientDidKey)

    // 3. CLIENT: Create verification submission (wraps a presentation submission)
    const submission = await createVerificationSubmission(
      clientDidKey,
      verificationRequest.presentation_definition,
      clientVC
    )

    const { req, res } = createMocks({
      method: "POST",
      query: { id: verificationRequest.request.id },
      body: submission
    })

    await handler(req, res)

    const response = res._getJSONData()
    expect(res.statusCode).toBe(200)
    expect(response).toEqual({ status: "ok" })

    const status = await fetchVerificationRequestStatus(
      verificationRequest.request.id
    )
    expect(status).toBe("approved")
  })
})

// TODO: This block should be easier to repro
async function generateVc(clientDidKey: DidKey) {
  const manifest = await findManifestById("KYCAMLAttestation")
  const user = await userFactory({
    jumioScore: 55,
    ofacScore: 2
  })
  const application = await createCredentialApplication(clientDidKey, manifest)
  await validateCredentialApplication(application, manifest)

  const decodedApplication = await decodeCredentialApplication(application)

  const fulfillment = await buildAndSignFulfillment(
    buildIssuer(process.env.ISSUER_DID, process.env.ISSUER_SECRET),
    decodedApplication,
    await generateRevocationListStatus(),
    fulfillmentDataForUser(user, manifest)
  )

  const fulfillmentVP = await decodeVerifiablePresentation(
    fulfillment.presentation
  )

  return fulfillmentVP.verifiableCredential[0]
}
