import {
  RevocableCredential,
  JWT,
  buildIssuer,
  revokeCredential,
  decodeVerifiableCredential
} from "verite"

import { apiHandler } from "../../../../../lib/api-fns"
import {
  findAllOrCreateRevocationLists,
  saveRevocationList
} from "../../../../../lib/database"
import { NotFoundError } from "../../../../../lib/errors"

export default apiHandler<string>(async (req, res) => {
  const jwt = req.body as JWT

  let credential: RevocableCredential
  try {
    credential = (await decodeVerifiableCredential(jwt)) as RevocableCredential
  } catch (e) {
    throw new NotFoundError()
  }

  // Find the credential's revocation list
  const url = credential.credentialStatus.statusListCredential
  const revocationLists = await findAllOrCreateRevocationLists()
  const revocationList = revocationLists.find((l) => l.id === url)

  // Revoke the credential
  const list = await revokeCredential(
    credential,
    revocationList,
    buildIssuer(process.env.ISSUER_DID, process.env.ISSUER_SECRET)
  )

  // Persist the new revocation list
  await saveRevocationList(list)

  res.send(list.proof.jwt)
})
