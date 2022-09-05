import { randomBytes } from "crypto"

import { buildAndSignFulfillment } from "../../../lib/issuer/credential-fulfillment"
import { KYCAML_CREDENTIAL_TYPE_NAME } from "../../../lib/sample-data"
import { buildKycAmlManifest } from "../../../lib/sample-data/manifests"
import { decodeVerifiablePresentation } from "../../../lib/utils"
import { buildIssuer, randomDidKey } from "../../../lib/utils/did-fns"
import { kycAmlAttestationFixture } from "../../fixtures/attestations"
import { KYC_ATTESTATION_SCHEMA_VC_OBJ } from "../../fixtures/credentials"
import { revocationListFixture } from "../../fixtures/revocation-list"

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
      KYCAML_CREDENTIAL_TYPE_NAME,
      {
        credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ,
        credentialStatus: revocationListFixture
      }
    )
    const fulfillment = await decodeVerifiablePresentation(encodedFulfillment)
    expect(fulfillment.credential_response).toBeDefined()
    expect(fulfillment.credential_response.manifest_id).toEqual(
      "KYCAMLManifest"
    )
  })
})
