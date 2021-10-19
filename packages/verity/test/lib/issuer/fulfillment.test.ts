import { buildAndSignFulfillment } from "../../../lib/issuer/fulfillment"
import {
  buildCredentialApplication,
  decodeCredentialApplication,
  createKycAmlManifest
} from "../../../lib/issuer/manifest"
import { buildIssuer, randomDidKey } from "../../../lib/utils/did-fns"
import { kycAmlAttestationFixture } from "../../fixtures/attestations"
import { revocationListFixture } from "../../fixtures/revocation-list"

describe("buildAndSignKycAmlFulfillment", () => {
  it("builds and signs a kyc/aml fulfillment", async () => {
    const issuerDidKey = await randomDidKey()
    const clientDidKey = await randomDidKey()
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const manifest = createKycAmlManifest(credentialIssuer)
    const credentialApplication = await buildCredentialApplication(
      clientDidKey,
      manifest
    )
    const decodedApplication = await decodeCredentialApplication(
      credentialApplication
    )

    const fulfillment = await buildAndSignFulfillment(
      issuer,
      decodedApplication,
      kycAmlAttestationFixture,
      { credentialStatus: revocationListFixture }
    )
    expect(fulfillment.credential_fulfillment).toBeDefined()
    expect(fulfillment.credential_fulfillment.manifest_id).toEqual(
      "KYCAMLAttestation"
    )
  })
})
