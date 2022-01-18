import { creditScoreManifest } from "../../../../lib/manifest/creditScore"

describe("Tests Credit Score Manifest", () => {
  it("tests for breaking Credit Score Manifest schema changes", async () => {
    expect.assertions(1)
    const cm = creditScoreManifest
    expect(cm).toMatchSnapshot()
  })
})
