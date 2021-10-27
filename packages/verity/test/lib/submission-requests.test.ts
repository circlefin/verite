import { challengeTokenUrlWrapper } from "../../lib/submission-requests"

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
