import {
  createCredentialApplication,
  createVerificationSubmission,
  decodeVerifiablePresentation,
  randomDidKey,
  validateCredentialSubmission
} from "@centre/verity"
import type { DidKey } from "@centre/verity"
import { createMocks } from "node-mocks-http"
import {
  fetchVerificationRequestStatus,
  generateRevocationListStatus,
  saveVerificationRequest
} from "../../../../../lib/database"
import { createKycAmlFulfillment } from "../../../../../lib/issuance/fulfillment"
import { findManifestById } from "../../../../../lib/manifest"
import { credentialSigner } from "../../../../../lib/signer"
import { generateKycVerificationRequest } from "../../../../../lib/verification/requests"
import handler from "../../../../../pages/api/verification/[id]/index"
import { userFactory } from "../../../../../test/factories"

describe("GET /verification/[id]", () => {
  it("returns the presentation definition", async () => {
    const verificationRequest = generateKycVerificationRequest()
    await saveVerificationRequest(verificationRequest)

    const { req, res } = createMocks({
      method: "GET",
      query: { id: verificationRequest.request.id }
    })

    await handler(req, res)

    const presentation = res._getJSONData()
    expect(res.statusCode).toBe(200)
    expect(presentation.request).toEqual(verificationRequest)
  })

  it("returns a 404 if given an invalid id", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { id: "invalid" }
    })

    await handler(req, res)

    expect(res.statusCode).toBe(404)
  })
})

describe("POST /verification/[id]", () => {
  it("validates the submission and updates the verification status", async () => {
    const verificationRequest = generateKycVerificationRequest()
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

// TODO: This block shoudl be easier to repro
async function generateVc(clientDidKey: DidKey) {
  const kycManifest = await findManifestById("KYCAMLAttestation")
  const user = await userFactory({
    jumioScore: 55,
    ofacScore: 2
  })
  const application = await createCredentialApplication(
    clientDidKey,
    kycManifest
  )
  const acceptedApplication = await validateCredentialSubmission(
    application,
    findManifestById
  )

  const fulfillment = await createKycAmlFulfillment(
    user,
    credentialSigner(),
    acceptedApplication,
    await generateRevocationListStatus()
  )

  const fulfillmentVP = await decodeVerifiablePresentation(
    fulfillment.presentation
  )

  return fulfillmentVP.verifiableCredential[0]
}
