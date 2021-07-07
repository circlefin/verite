import { NextApiHandler } from "next"
import { ApiError, notFound } from "lib/api-fns"
import {
  findUserFromManfiestToken,
  generateIssuanceManifestForUser
} from "lib/issuance/manifest"
import { CredentialManifest } from "types"

const ManifestHandler: NextApiHandler<CredentialManifest | ApiError> = async (
  req,
  res
) => {
  const { token } = req.query
  const user = await findUserFromManfiestToken(token as string)

  if (!user) {
    return notFound(res)
  }

  const manifest = generateIssuanceManifestForUser(user)

  res.json(manifest)
}

export default ManifestHandler
