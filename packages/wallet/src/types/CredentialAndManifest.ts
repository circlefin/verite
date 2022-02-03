import { CredentialManifest, Verifiable, W3CCredential } from "../lib/verite"

export type CredentialAndManifest = {
  id: string
  credential: Verifiable<W3CCredential>
  manifest: CredentialManifest
  revoked: boolean
}
