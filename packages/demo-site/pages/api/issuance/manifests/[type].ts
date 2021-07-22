import { notFound } from "lib/api-fns"
import { MANIFEST_MAP } from "lib/issuance/manifest"
import { NextApiHandler } from "next"
import { CredentialManifest } from "verity"

const handler: NextApiHandler<CredentialManifest> = async (req, res) => {
  const manifest = MANIFEST_MAP[req.query.type as string]

  if (!manifest) {
    return notFound(res)
  }

  res.json(manifest)
}

export default handler
