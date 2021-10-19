import { createKycAmlManifest } from "../../lib/issuer/manifest"
import {
  challengeTokenUrlWrapper,
  buildCredentialOffer
} from "../../lib/submission-requests"
import { didKeyToIssuer, randomDidKey } from "../../lib/utils"

describe("challengeTokenUrlWrapper", () => {
  it("works", () => {
    const challengeTokenUrl =
      "http://localhost:3000/40882719-1508-4844-ae28-fdfe57d69c5b"
    const output = challengeTokenUrlWrapper(challengeTokenUrl)
    expect(output).toEqual({
      challengeTokenUrl
    })
  })
})

describe("buildCredentialOffer", () => {
  it("works", async () => {
    // Issuer DID
    const issuerDidKey = randomDidKey()
    const issuer = didKeyToIssuer(issuerDidKey)

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
