import { apiHandler, requireMethod } from "../../../../../lib/api-fns"

type ResponseType = {
  status: string
}

export default apiHandler<ResponseType>(async (req, res) => {
  requireMethod(req, "POST")

  res.json({ status: "ok" })
})
