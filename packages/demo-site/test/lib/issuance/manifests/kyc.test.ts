import { kycManifest } from "lib/issuance/manifests/kyc"

describe("Tests KYC Manifest", () => {
  it("tests for breaking KYC Manifest schema changes", async () => {
    expect.assertions(1)
    const km = kycManifest
    expect(km).toMatchSnapshot()
  })
})
