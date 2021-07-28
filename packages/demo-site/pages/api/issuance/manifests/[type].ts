import { CredentialManifest } from "@centre/verity"
import { apiHandler, notFound } from "../../../../lib/api-fns"
import { MANIFEST_MAP } from "../../../../lib/issuance/manifest"

export default apiHandler<CredentialManifest>(async (req, res) => {
  const manifest = MANIFEST_MAP[req.query.type as string]

  if (!manifest) {
    return notFound(res)
  }

  res.json(manifest)
})
