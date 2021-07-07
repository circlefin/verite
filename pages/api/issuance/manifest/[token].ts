import { NextApiHandler } from "next"
import {
  findUserFromManfiestToken,
  generateIssuanceManifestForUser
} from "lib/issuance/manifest"

const ManifestHandler: NextApiHandler = async (req, res) => {
  const { token } = req.query
  const user = await findUserFromManfiestToken(token as string)

  if (!user) {
    return res.status(404).send("Not Found")
  }

  const manifest = generateIssuanceManifestForUser(user)

  res.json(manifest)
}

export default ManifestHandler
