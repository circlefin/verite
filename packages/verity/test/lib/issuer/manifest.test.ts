import { omit } from "lodash"
import { hasPaths } from "../../../lib"
import {
  createKycAmlManifest,
  validateManifestFormat
} from "../../../lib/issuer/manifest"
import { didKeyToIssuer } from "../../../lib/utils/did-fns"
import { randomDidKey } from "../../support/did-fns"

describe("createKycAmlManifest", () => {
  it("builds a KYC/AML manifest", async () => {
    const issuerDidKey = await randomDidKey()
    const issuer = didKeyToIssuer(issuerDidKey)
    const credentialIssuer = { id: issuer.did, name: "Verity" }

    const manifest = createKycAmlManifest(credentialIssuer)

    expect(manifest.id).toEqual("KYCAMLAttestation")
    expect(validateManifestFormat(manifest)).toBe(true)
  })
})

describe("validateManifestFormat", () => {
  it("returns true if all required fields are present", async () => {
    const issuerDidKey = await randomDidKey()
    const issuer = didKeyToIssuer(issuerDidKey)
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const manifest = omit(createKycAmlManifest(credentialIssuer), [
      "format",
      "presentation_definition"
    ])

    expect(validateManifestFormat(manifest)).toBe(true)
  })

  it("ignores optional fields", async () => {
    const issuerDidKey = await randomDidKey()
    const issuer = didKeyToIssuer(issuerDidKey)
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const manifest = createKycAmlManifest(credentialIssuer)

    expect(hasPaths(manifest, ["presentation_definition", "format"])).toBe(true)
    expect(validateManifestFormat(manifest)).toBe(true)
  })

  it("returns false if any of the fields are missing", async () => {
    const issuerDidKey = await randomDidKey()
    const issuer = didKeyToIssuer(issuerDidKey)
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const manifest = createKycAmlManifest(credentialIssuer)
    const requiredKeys = ["id", "version", "issuer", "output_descriptors"]

    requiredKeys.forEach((key) => {
      const omitted = omit(manifest, [key])
      expect(validateManifestFormat(omitted)).toBe(false)
    })
  })
})
