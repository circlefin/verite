import { createKycAmlManifest, manifestWrapper } from "@centre/verity"
import { NextApiRequest, NextApiResponse } from "next"

export default async function helloAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Generate manifest
  const manifest = createKycAmlManifest({
    id: process.env.NEXT_PUBLIC_ISSUER_DID,
    name: "Verity"
  })

  // Wrap the manifest with additional metadata, such as the URL to post the
  // request to, so the mobile wallet knows how to request the credential.
  // In a production environment, the URL would need to be absolute, but for
  // sake of simplicity we will just use a path since the demo is entirely
  // within the browser.
  const wrapper = manifestWrapper(
    manifest,
    process.env.NEXT_PUBLIC_ISSUER_DID,
    `/api/credentials/${req.query.token}`
  )

  // Response
  res.status(200).json(wrapper)
}
