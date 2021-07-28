import { CredentialSigner } from "@centre/verity"

let _credentialSigner: CredentialSigner

export function credentialSigner(): CredentialSigner {
  if (!_credentialSigner) {
    _credentialSigner = new CredentialSigner(
      process.env.ISSUER_DID,
      process.env.ISSUER_SECRET
    )
  }

  return _credentialSigner
}
