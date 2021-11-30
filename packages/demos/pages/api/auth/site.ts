import { apiHandler, requireMethod } from "@verity/demos/lib/api-fns"
import { authenticate } from "@verity/demos/lib/database/demoAccounts"
import Cookies from "cookies"

type Response = {
  status: string
}

/**
 * This is a simple API to handle authentication to view
 * the documentation and the demos. It is not intended to be
 * considered secure or production-ready. It is merely a simple
 * gatekeeper while the documentation is not public.
 */
export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  const cookies = new Cookies(req, res)
  const { password } = req.body
  const isAuthenticated = await authenticate(password)

  if (isAuthenticated) {
    cookies.set("verity-auth", "1", {
      httpOnly: false
    })
    res.status(200).json({ status: "ok" })
  } else {
    cookies.set("verity-auth")
    res.status(400).json({ status: "invalid" })
  }
})
