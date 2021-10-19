import { omit } from "lodash"
import { hasPaths } from "../../../lib"
import { createKycAmlManifest } from "../../../lib/issuer/manifest"
import { buildIssuer, randomDidKey } from "../../../lib/utils/did-fns"
import { CredentialManifest } from "../../../types"

function validateManifestFormat(
  manifest: CredentialManifest | Record<string, unknown>
): boolean {
  return hasPaths(manifest, [
    "id",
    "version",
    "issuer.id",
    "output_descriptors[0]"
  ])
}

describe("createKycAmlManifest", () => {
  it("builds a KYC/AML manifest", async () => {
    const issuerDidKey = await randomDidKey()
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
    const credentialIssuer = { id: issuer.did, name: "Verity" }

    const manifest = createKycAmlManifest(credentialIssuer)

    expect(manifest.id).toEqual("KYCAMLAttestation")
    expect(validateManifestFormat(manifest)).toBe(true)
  })
})

describe("validateManifestFormat", () => {
  it("returns true if all required fields are present", async () => {
    const issuerDidKey = await randomDidKey()
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const manifest = omit(createKycAmlManifest(credentialIssuer), [
      "format",
      "presentation_definition"
    ])

    expect(validateManifestFormat(manifest)).toBe(true)
  })

  it("ignores optional fields", async () => {
    const issuerDidKey = await randomDidKey()
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const manifest = createKycAmlManifest(credentialIssuer)

    expect(hasPaths(manifest, ["presentation_definition", "format"])).toBe(true)
    expect(validateManifestFormat(manifest)).toBe(true)
  })

  it("returns false if any of the fields are missing", async () => {
    const issuerDidKey = await randomDidKey()
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const manifest = createKycAmlManifest(credentialIssuer)
    const requiredKeys = ["id", "version", "issuer", "output_descriptors"]

    requiredKeys.forEach((key) => {
      const omitted = omit(manifest, [key])
      expect(validateManifestFormat(omitted)).toBe(false)
    })
  })
})
