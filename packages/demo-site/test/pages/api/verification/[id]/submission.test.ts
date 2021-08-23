import {
  buildIssuer,
  buildAndSignFulfillment,
  createCredentialApplication,
  createVerificationSubmission,
  decodeVerifiablePresentation,
  generateVerificationRequest,
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
import { buildAttestationForUser } from "../../../../../lib/issuance/fulfillment"
import { findManifestById } from "../../../../../lib/manifest"
import handler from "../../../../../pages/api/verification/[id]/submission"
import { userFactory } from "../../../../../test/factories"

describe("POST /verification/[id]/submission", () => {
  it("validates the submission and updates the verification status", async () => {
    const verificationRequest = generateVerificationRequest(
      "KYCAMLAttestation",
      process.env.VERIFIER_DID,
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/submission`,
      `${process.env.HOST}/api/verification/callback`
    )
    await saveVerificationRequest(verificationRequest)
    const clientDidKey = await randomDidKey()
    const clientVC = await generateKycAmlVc(clientDidKey)

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
    expect(response).toEqual({ status: "approved" })

    const status = await fetchVerificationRequestStatus(
      verificationRequest.request.id
    )
    expect(status.status).toBe("approved")
  })

  it("returns a result object for use in a smart contract", async () => {
    const subject = "0x39C55A1Da9F3f6338A1789fE195E8a47b9484E18"
    const contract = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
    const verificationRequest = generateVerificationRequest(
      "KYCAMLAttestation",
      process.env.VERIFIER_DID,
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/submission?subjectAddress=${subject}&contractAddress=${contract}`,
      `${process.env.HOST}/api/verification/callback`
    )
    await saveVerificationRequest(verificationRequest)
    const clientDidKey = await randomDidKey()
    const clientVC = await generateKycAmlVc(clientDidKey)

    const submission = await createVerificationSubmission(
      clientDidKey,
      verificationRequest.presentation_definition,
      clientVC
    )

    const { req, res } = createMocks({
      method: "POST",
      query: {
        id: verificationRequest.request.id,
        subjectAddress: subject,
        contractAddress: contract
      },
      body: submission
    })

    await handler(req, res)

    const response = res._getJSONData()
    expect(res.statusCode).toBe(200)
    expect(response.status).toEqual("approved")
    expect(response.result).toBeDefined()
    expect(response.result).toHaveProperty("signature")
    expect(response.result).toHaveProperty("verificationInfo")
    expect(response.result.verificationInfo).toHaveProperty("expiration")
    expect(response.result.verificationInfo).toHaveProperty("message")
    expect(response.result.verificationInfo).toHaveProperty("subjectAddress")

    const status = await fetchVerificationRequestStatus(
      verificationRequest.request.id
    )
    expect(status.status).toBe("approved")
    expect(status.result).toBeDefined()
  })

  it("rejects and returns errors on an invalid input", async () => {
    const verificationRequest = generateVerificationRequest(
      "CreditScoreAttestation",
      process.env.VERIFIER_DID,
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/submission`,
      `${process.env.HOST}/api/verification/callback`
    )
    await saveVerificationRequest(verificationRequest)
    const clientDidKey = await randomDidKey()
    const clientVC = await generateKycAmlVc(clientDidKey)

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

    expect(res.statusCode).toBe(400)
    const response = res._getJSONData()
    expect(response).toEqual({
      status: 400,
      errors: [
        {
          message:
            "Credential failed to meet criteria specified by input descriptor creditScore_input",
          details:
            "Credential did not match constraint: The Credit Score Attestation requires the field: 'score'."
        }
      ]
    })

    const status = await fetchVerificationRequestStatus(
      verificationRequest.request.id
    )
    expect(status.status).toBe("rejected")
    expect(status.result).toBeUndefined()
  })
})

// TODO: This block should be easier to repro
async function generateKycAmlVc(clientDidKey: DidKey) {
  const manifest = await findManifestById("KYCAMLAttestation")
  const user = await userFactory()
  const application = await createCredentialApplication(clientDidKey, manifest)
  await validateCredentialApplication(application, manifest)

  const decodedApplication = await decodeCredentialApplication(application)
  const credentialStatus = await generateRevocationListStatus()

  const fulfillment = await buildAndSignFulfillment(
    buildIssuer(process.env.ISSUER_DID, process.env.ISSUER_SECRET),
    decodedApplication,
    buildAttestationForUser(user, manifest),
    { credentialStatus }
  )

  const fulfillmentVP = await decodeVerifiablePresentation(
    fulfillment.presentation
  )

  return fulfillmentVP.verifiableCredential[0]
}
