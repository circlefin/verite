import { NextApiHandler } from "next"
import { MANIFEST_MAP } from "lib/issuance/manifest"
import { CredentialManifest } from "types"

const handler: NextApiHandler<CredentialManifest> = async (req, res) => {
  res.json(MANIFEST_MAP.kyc)
}

export default handler
