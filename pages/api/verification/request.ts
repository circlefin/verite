import { NextApiHandler } from "next"

const handler: NextApiHandler = (req, res) => {
  res.json({ status: "ok" })
}

export default handler
