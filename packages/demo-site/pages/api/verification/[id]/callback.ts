import { apiHandler } from "../../../../lib/api-fns"

type ResponseType = {
  status: string
}

export default apiHandler<ResponseType>(async (req, res) => {
  res.json({ status: "ok" })
})
