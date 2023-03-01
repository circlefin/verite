import { OutputDescriptor, Verifiable, W3CCredential } from "verite"

export type CredentialAndDescriptor = {
  id: string
  credential: Verifiable<W3CCredential>
  descriptor: OutputDescriptor
  revoked: boolean
}
