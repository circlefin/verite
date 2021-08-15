import type { ManifestWrapper } from "@centre/verity"
import { manifestWrapper } from "@centre/verity"
import { NotFoundError } from "../../../..//lib/errors"
import { apiHandler } from "../../../../lib/api-fns"
import { MANIFEST_MAP } from "../../../../lib/manifest"

export default apiHandler<ManifestWrapper>(async (req, res) => {
  const manifestName = req.query.type as string
  const token = req.query.token as string
  const manifest = MANIFEST_MAP[manifestName]

  if (!manifest) {
    throw new NotFoundError()
  }

  res.json(
    manifestWrapper(manifest, `${process.env.NGROK_HOST}/api/issuance/${token}`)
  )
})
