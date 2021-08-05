import { createCredentialApplication } from "../../lib/credential-application-fns"
import { createKycAmlManifest } from "../../lib/issuer/manifest"
import { didKeyToIssuer, randomDidKey } from "../../lib/utils/did-fns"

describe("createCredentialApplication", () => {
  it("builds a valid credential application", async () => {
    const issuerDidKey = await randomDidKey()
    const issuer = didKeyToIssuer(issuerDidKey)

    // 1. CLIENT: The client gets a DID
    const clientDidKey = await randomDidKey()
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const kycManifest = createKycAmlManifest(credentialIssuer)

    const credentialApplication = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )

    expect(credentialApplication.credential_application).toBeDefined()
    expect(credentialApplication.credential_application.manifest_id).toEqual(
      "KYCAMLAttestation"
    )
    expect(credentialApplication.presentation_submission).toBeDefined()
    expect(
      credentialApplication.presentation_submission?.definition_id
    ).toEqual(kycManifest.presentation_definition?.id)
  })
})
