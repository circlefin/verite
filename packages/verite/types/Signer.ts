import { DidJwtIssuer } from "."

export interface Signer {
  did: string
  signerImpl: DidJwtIssuer
  keyId: string
  alg?: string
}
