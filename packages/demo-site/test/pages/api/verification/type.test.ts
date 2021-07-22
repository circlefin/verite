import { createMocks } from "node-mocks-http"
import handler from "pages/api/verification/request"

describe("GET /verification/request", () => {
  it("returns the presentation definition", async () => {
    const { req, res } = createMocks({ method: "GET" })

    await handler(req, res)

    const presentation = res._getJSONData()
    expect(res.statusCode).toBe(200)
    expect(presentation.definition).toMatchSnapshot()
  })
})
