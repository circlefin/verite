import { buildKycAmlManifest, buildCredentialOffer } from "@centre/verity"
import { NextApiRequest, NextApiResponse } from "next"
import { v4 as uuidv4 } from "uuid"

export default async function helloAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Generate manifest
  const manifest = buildKycAmlManifest({
    id: process.env.NEXT_PUBLIC_ISSUER_DID,
    name: "Verity"
  })

  // Wrap the manifest with additional metadata, such as the URL to post the
  // request to, so the mobile wallet knows how to request the credential.
  // In a production environment, the URL would need to be absolute, but for
  // sake of simplicity we will just use a path since the demo is entirely
  // within the browser.
  const wrapper = buildCredentialOffer(
    uuidv4(),
    manifest,
    process.env.NEXT_PUBLIC_ISSUER_DID,
    `/api/credentials/${req.query.token}`
  )

  // Response
  res.status(200).json(wrapper)
}
