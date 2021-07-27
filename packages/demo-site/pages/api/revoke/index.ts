import {
  decodeVerifiableCredential,
  RevocableCredential,
  revokeCredential,
  JWT
} from "@centre/verity"
import { apiHandler, notFound } from "lib/api-fns"
import { allRevocationLists, saveRevocationList } from "lib/database"
import { credentialSigner } from "lib/signer"

export default apiHandler<string>(async (req, res) => {
  const jwt = req.body as JWT

  let credential: RevocableCredential
  try {
    credential = (await decodeVerifiableCredential(jwt)) as RevocableCredential
  } catch (e) {
    return notFound(res)
  }

  // Find the credential's revocation list
  const url = credential.credentialStatus.statusListCredential
  const revocationLists = await allRevocationLists()
  const revocationList = revocationLists.find((l) => l.id === url)

  // Revoke the credential
  const list = await revokeCredential(
    credential,
    revocationList,
    credentialSigner
  )

  // Persist the new revocation list
  await saveRevocationList(list)

  res.send(list.proof.jwt)
})
