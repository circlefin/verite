import { MaybeRevocableCredential } from "@verity/verity"
import { apiHandler } from "../../../lib/api-fns"
import { findNewestCredentialSinceDate } from "../../../lib/database/credentials"

type Resp = {
  credential: MaybeRevocableCredential
}

/**
 * Find and return the latest credential created after
 * the provided date. This method is used in the issuer demo to
 * update the state on the web-app when a mobile app scans
 * the QR code and requests a credential.
 */
export default apiHandler<Resp>(async (req, res) => {
  const createdAt = new Date(req.query.createdAt as string)

  const credential = await findNewestCredentialSinceDate(createdAt)

  res.json({ credential })
})
