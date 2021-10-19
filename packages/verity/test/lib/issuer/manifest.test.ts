import { omit } from "lodash"
import { hasPaths } from "../../../lib"
import { buildCredentialOffer } from "../../../lib/issuer/credential-offer"
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

describe("buildCredentialOffer", () => {
  it("works", async () => {
    // Issuer DID
    const issuerDidKey = randomDidKey()
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)

    // Build a Manifest
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const manifest = createKycAmlManifest(credentialIssuer)

    // Inputs
    const id = "8117fe2e-1e8c-4c3f-87a4-700424f8e92f"
    const from = "did:web:verity.id"
    const replyUrl = "http://localhost:3000/reply-url"
    const wrapper = buildCredentialOffer(id, manifest, from, replyUrl)

    // Validate the result includes the inputs
    expect(wrapper.id).toEqual(id)
    expect(wrapper.reply_url).toEqual("http://localhost:3000/reply-url")
    expect(wrapper.from).toEqual(from)
    expect(wrapper.body.manifest).toEqual(manifest)

    // Validate the result includes additional, expected properties
    expect(wrapper.type).toEqual("https://verity.id/types/CredentialOffer")
    expect(wrapper.created_time).toBeDefined()
    expect(wrapper.expires_time).toBeDefined()

    // When signing the Credential Application, you must include the challenge.
    // Validate that it is present.
    expect(wrapper.body.challenge).toBeDefined()
  })
})
