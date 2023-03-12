import { randomBytes } from "crypto"
import { v4 as uuidv4 } from "uuid"
import {
  buildIssuer,
  composeFulfillmentFromAttestation,
  composePresentationSubmission,
  verifyVerifiablePresentation,
  randomDidKey,
  buildKycVerificationOffer,
  buildCreditScoreVerificationOffer,
  attestationToCredentialType,
  AttestationTypes
} from "verite"

import {
  fetchVerificationOfferStatus,
  saveVerificationOffer
} from "../../../../../lib/database"
import { buildAttestationForUser } from "../../../../../lib/issuance/fulfillment"
import { findManifestById } from "../../../../../lib/manifest"
import { fullURL } from "../../../../../lib/utils"
import handler from "../../../../../pages/api/demos/verifier/[id]/submission"
import { userFactory } from "../../../../factories"
import { createMocks } from "../../../../support/mocks"
import { kycAttestationSchema } from "../../../../support/schemas"

import type { DidKey } from "verite"

describe("POST /verification/[id]/submission", () => {
  it("validates the submission and updates the verification status", async () => {
    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      process.env.VERIFIER_DID,
      fullURL("/api/demos/verifier/submission"),
      fullURL("/api/demos/verifier/callback")
    )
    await saveVerificationOffer(verificationRequest)
    const clientDidKey = await randomDidKey(randomBytes)
    const clientVC = await generateKycAmlVc(clientDidKey)

    const submission = await composePresentationSubmission(
      clientDidKey,
      verificationRequest.body.presentation_definition,
      clientVC,
      { challenge: verificationRequest.body.challenge }
    )

    const { req, res } = createMocks({
      method: "POST",
      query: { id: verificationRequest.id },
      body: submission as unknown as Body
    })

    await handler(req, res)

    const response = res._getJSONData()
    expect(res.statusCode).toBe(200)
    expect(response).toEqual({ status: "approved" })

    const status = await fetchVerificationOfferStatus(verificationRequest.id)
    expect(status.status).toBe("approved")
  })

  it("returns a result object for use in a smart contract", async () => {
    const subject = "0x39C55A1Da9F3f6338A1789fE195E8a47b9484E18"
    const contract = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      process.env.VERIFIER_DID,
      fullURL(
        `/api/demos/verifier/submission?subjectAddress=${subject}&registryAddress=${contract}`
      ),
      fullURL("/api/demos/verifier/callback")
    )
    await saveVerificationOffer(verificationRequest)
    const clientDidKey = await randomDidKey(randomBytes)
    const clientVC = await generateKycAmlVc(clientDidKey)

    const submission = await composePresentationSubmission(
      clientDidKey,
      verificationRequest.body.presentation_definition,
      clientVC,
      { challenge: verificationRequest.body.challenge }
    )

    const { req, res } = createMocks({
      method: "POST",
      query: {
        id: verificationRequest.id,
        subjectAddress: subject,
        registryAddress: contract
      },
      body: submission as unknown as Body
    })

    await handler(req, res)

    const response = res._getJSONData()
    expect(res.statusCode).toBe(200)
    expect(response.status).toEqual("approved")
    expect(response.result).toBeDefined()
    expect(response.result).toHaveProperty("signature")
    expect(response.result).toHaveProperty("verificationResult")
    expect(response.result.verificationResult).toHaveProperty("expiration")
    expect(response.result.verificationResult).toHaveProperty("schema")
    expect(response.result.verificationResult).toHaveProperty("subject")

    const status = await fetchVerificationOfferStatus(verificationRequest.id)
    expect(status.status).toBe("approved")
    expect(status.result).toBeDefined()
  })

  it("rejects and returns errors on an invalid input", async () => {
    const verificationRequest = buildCreditScoreVerificationOffer(
      uuidv4(),
      process.env.VERIFIER_DID,
      fullURL("/api/demos/verifier/submission"),
      fullURL("/api/demos/verifier/callback"),
      [],
      700
    )
    await saveVerificationOffer(verificationRequest)
    const clientDidKey = await randomDidKey(randomBytes)
    const clientVC = await generateKycAmlVc(clientDidKey)

    const submission = await composePresentationSubmission(
      clientDidKey,
      verificationRequest.body.presentation_definition,
      clientVC,
      { challenge: verificationRequest.body.challenge }
    )

    const { req, res } = createMocks({
      method: "POST",
      query: { id: verificationRequest.id },
      body: submission as unknown as Body
    })

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    const response = res._getJSONData()
    expect(response).toEqual({
      status: 400,
      errors: [
        {
          message:
            "Credential failed to meet criteria specified by input descriptor CreditScoreCredential",
          details:
            "Credential did not match constraint: We can only accept credentials where the score value is above 700."
        }
      ]
    })

    const status = await fetchVerificationOfferStatus(verificationRequest.id)
    expect(status.status).toBe("rejected")
    expect(status.result).toBeUndefined()
  })
})

async function generateKycAmlVc(clientDidKey: DidKey) {
  const manifest = await findManifestById("KYCAMLManifest")
  const user = await userFactory()
  const userAttestation = buildAttestationForUser(
    user,
    AttestationTypes.KYCAMLAttestation
  )
  const fulfillment = await composeFulfillmentFromAttestation(
    buildIssuer(process.env.ISSUER_DID, process.env.ISSUER_SECRET),
    clientDidKey.subject,
    manifest,
    userAttestation,
    attestationToCredentialType(AttestationTypes.KYCAMLAttestation),
    { credentialSchema: kycAttestationSchema }
  )

  const fulfillmentVP = await verifyVerifiablePresentation(fulfillment)

  return fulfillmentVP.verifiableCredential[0]
}
