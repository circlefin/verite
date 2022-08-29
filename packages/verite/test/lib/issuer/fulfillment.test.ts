import { randomBytes } from "crypto"

import { buildAndSignFulfillment } from "../../../lib/issuer/credential-fulfillment"
import { buildKycAmlManifest } from "../../../lib/issuer/credential-manifest"
import { decodeVerifiablePresentation } from "../../../lib/utils"
import { buildIssuer, randomDidKey } from "../../../lib/utils/did-fns"
import { kycAmlAttestationFixture } from "../../fixtures/attestations"
import { revocationListFixture } from "../../fixtures/revocation-list"
import { kycAttestationSchema } from "../../fixtures/schemas"
import { kycAmlCredentialTypeName } from "../../fixtures/types"

describe("buildAndSignKycAmlFulfillment", () => {
  it("builds and signs a kyc/aml fulfillment", async () => {
    const issuerDidKey = await randomDidKey(randomBytes)
    const clientDidKey = await randomDidKey(randomBytes)
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
    const credentialIssuer = { id: issuer.did, name: "Verite" }
    const manifest = buildKycAmlManifest(credentialIssuer)

    const encodedFulfillment = await buildAndSignFulfillment(
      issuer,
      clientDidKey.subject,
      manifest,
      kycAmlAttestationFixture,
      kycAmlCredentialTypeName,
      kycAttestationSchema,
      { credentialStatus: revocationListFixture }
    )
    const fulfillment = await decodeVerifiablePresentation(encodedFulfillment)
    expect(fulfillment.credential_fulfillment).toBeDefined()
    expect(fulfillment.credential_fulfillment.manifest_id).toEqual(
      "KYCAMLManifest"
    )
  })
})
