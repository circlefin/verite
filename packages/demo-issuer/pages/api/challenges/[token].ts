import { NextApiRequest, NextApiResponse } from "next"
import { v4 as uuidv4 } from "uuid"
import {
  buildSampleProcessApprovalManifest,
  buildCredentialOffer,
  AttestationTypes
} from "verite"

import { ManifestMap } from "../manifests"

export default async function challenges(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Generate manifest
  const manifest = buildSampleProcessApprovalManifest(
    AttestationTypes.KYCAMLAttestation,
    {
      id: process.env.NEXT_PUBLIC_ISSUER_DID,
      name: "Verite"
    }
  )

  ManifestMap[manifest.id] = manifest
  // Wrap the manifest with additional metadata, such as the URL to post the
  // request to, so the mobile wallet knows how to request the credential.
  // In a production environment, the URL would need to be absolute, but for
  // sake of simplicity we will just use a path since the demo is entirely
  // within the browser.
  const wrapper = buildCredentialOffer(
    uuidv4(),
    manifest,
    `${process.env.NEXT_PUBLIC_BASEURL}/api/credentials/${req.query.token}`
  )

  // Response
  res.status(200).json(wrapper)
}
