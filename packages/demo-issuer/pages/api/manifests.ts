import {
  randomDidKey,
  didKeyToIssuer,
  createKycAmlManifest,
  createCreditScoreManifest
} from "@centre/verity"
import { NextApiRequest, NextApiResponse } from "next"

export default async function helloAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  /**
   * Get signer (issuer)
   *
   * Manifests reference the issuers that can issue the credential. In this
   * example, we generate a random one. However, a production environment would
   * load this from some persistent store.
   */
  const signer = didKeyToIssuer(randomDidKey())

  // Generate each manifest
  const manifests = [
    createKycAmlManifest({ id: signer.did }),
    createCreditScoreManifest({ id: signer.did })
  ]

  // Response
  res.status(200).json(manifests)
}
